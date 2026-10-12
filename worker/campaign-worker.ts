import { prisma } from "../src/lib/db/prisma";
import { getAuthenticatedGmailClient } from "../src/lib/auth/token-service";
import { buildRawMimeMessage } from "../src/lib/gmail/mime-builder";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const WORKER_ID = `worker_${process.pid}_${crypto.randomBytes(4).toString("hex")}`;
const LEASE_DURATION_MS = 30_000; // 30 seconds
const HEARTBEAT_INTERVAL_MS = 10_000; // 10 seconds

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateJitteredBackoff(attempt: number, baseMs = 2000): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 1000);
  return exponential + jitter;
}

function isTransientError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || (err.response && err.response.status);
  const message = String(err.message || "").toLowerCase();

  // Rate limit / Server errors / Network drops
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  if (
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("enotfound") ||
    message.includes("rate limit")
  ) {
    return true;
  }
  return false;
}

function isAmbiguousNetworkError(err: any): boolean {
  if (!err) return false;
  const message = String(err.message || "").toLowerCase();
  const code = String(err.code || "").toLowerCase();
  return (
    code === "econnreset" ||
    code === "etimedout" ||
    message.includes("socket hang up") ||
    message.includes("timeout") ||
    message.includes("network error")
  );
}

export class CampaignWorker {
  private isRunning = false;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private currentCampaignId: string | null = null;

  /**
   * Safe startup recovery:
   * Inspects all recipients stuck in 'sending' status and marks them as 'needs_review'
   * to guarantee they are never blindly resent after a crash/restart.
   */
  async recoverOrphanedTasks(): Promise<void> {
    console.log("[Worker] Performing startup recovery for interrupted tasks...");

    const stuckRecipients = await prisma.recipient.findMany({
      where: { status: "sending" },
      select: { id: true, email: true, campaignId: true },
    });

    if (stuckRecipients.length > 0) {
      console.warn(
        `[Worker] Found ${stuckRecipients.length} recipients stuck in 'sending' state. Marking as 'needs_review'.`
      );

      for (const rec of stuckRecipients) {
        await prisma.recipient.update({
          where: { id: rec.id },
          data: {
            status: "needs_review",
            errorCode: "WORKER_RESTARTED_IN_FLIGHT",
            errorMessage:
              "The worker was restarted while this email was being processed. To avoid duplicate delivery, verify status before retrying.",
          },
        });
      }

      // Update counters for affected campaigns
      const affectedCampaignIds = Array.from(new Set(stuckRecipients.map((r) => r.campaignId)));
      for (const campId of affectedCampaignIds) {
        await this.syncCampaignCounters(campId);
      }
    }

    // Clean up stale leases older than lease duration
    const expiredCutoff = new Date(Date.now() - LEASE_DURATION_MS);
    await prisma.workerLease.deleteMany({
      where: { expiresAt: { lt: expiredCutoff } },
    });

    console.log("[Worker] Startup recovery complete.");
  }

  /**
   * Attempts to acquire an atomic worker lease for a campaign.
   */
  private async acquireLease(campaignId: string): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LEASE_DURATION_MS);

    try {
      await prisma.workerLease.upsert({
        where: { campaignId },
        update: {
          workerId: WORKER_ID,
          heartbeatAt: now,
          expiresAt,
        },
        create: {
          campaignId,
          workerId: WORKER_ID,
          heartbeatAt: now,
          acquiredAt: now,
          expiresAt,
        },
      });

      this.currentCampaignId = campaignId;
      this.startHeartbeat(campaignId);
      return true;
    } catch {
      return false;
    }
  }

  private startHeartbeat(campaignId: string) {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + LEASE_DURATION_MS);
        await prisma.workerLease.update({
          where: { campaignId },
          data: { heartbeatAt: now, expiresAt },
        });
      } catch (err) {
        console.error("[Worker] Heartbeat update error:", err);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async releaseLease(campaignId: string) {
    this.stopHeartbeat();
    try {
      await prisma.workerLease.deleteMany({
        where: { campaignId, workerId: WORKER_ID },
      });
    } catch {
      // Lease might already be removed
    }
    this.currentCampaignId = null;
  }

  /**
   * Recalculates and updates campaign status counters.
   */
  async syncCampaignCounters(campaignId: string): Promise<void> {
    const counts = await prisma.recipient.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { status: true },
    });

    let sentCount = 0;
    let failedCount = 0;
    let needsReviewCount = 0;
    let pendingCount = 0;

    for (const item of counts) {
      switch (item.status) {
        case "sent":
          sentCount = item._count.status;
          break;
        case "failed":
          failedCount = item._count.status;
          break;
        case "needs_review":
          needsReviewCount = item._count.status;
          break;
        case "pending":
          pendingCount = item._count.status;
          break;
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        sentCount,
        failedCount,
        needsReviewCount,
        pendingCount,
      },
    });
  }

  /**
   * Main execution loop for an active campaign.
   */
  async processCampaign(campaignId: string): Promise<void> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        attachments: true,
        gmailAccount: true,
      },
    });

    if (!campaign) {
      console.error(`[Worker] Campaign ${campaignId} not found.`);
      return;
    }

    if (campaign.status === "paused" || campaign.status === "cancelled") {
      console.log(`[Worker] Campaign ${campaignId} is already ${campaign.status}. Skipping.`);
      return;
    }

    // Only one campaign per Gmail account can be active
    const activeRunningOther = await prisma.campaign.findFirst({
      where: {
        gmailAccountId: campaign.gmailAccountId,
        status: "running",
        id: { not: campaignId },
      },
    });

    if (activeRunningOther) {
      console.warn(
        `[Worker] Another campaign (${activeRunningOther.id}) is currently running for this Gmail account. Waiting.`
      );
      return;
    }

    const acquired = await this.acquireLease(campaignId);
    if (!acquired) {
      console.warn(`[Worker] Could not acquire lease for campaign ${campaignId}. Another worker may be processing it.`);
      return;
    }

    console.log(`[Worker] Acquired lease for campaign ${campaignId}. Setting status to 'running'.`);
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "running",
        startedAt: campaign.startedAt || new Date(),
      },
    });

    let gmailClientInstance: any = null;
    let senderEmail = campaign.gmailAccount.email;

    if (!campaign.isDryRun) {
      try {
        const clientData = await getAuthenticatedGmailClient();
        gmailClientInstance = clientData.gmail;
        senderEmail = clientData.account.email;
      } catch (err: any) {
        console.error(`[Worker] Failed to obtain Gmail client for campaign ${campaignId}:`, err.message);
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "completed_with_errors" },
        });
        await this.releaseLease(campaignId);
        return;
      }
    }

    const delayMs = Math.max(2, campaign.delaySeconds) * 1000;

    try {
      while (true) {
        // Refresh campaign status to detect Pause or Cancel signals
        const freshCampaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true },
        });

        if (!freshCampaign || freshCampaign.status === "paused" || freshCampaign.status === "cancelled") {
          console.log(`[Worker] Campaign ${campaignId} is ${freshCampaign?.status}. Halting execution.`);
          break;
        }

        // Fetch next eligible pending recipient in order
        const recipient = await prisma.recipient.findFirst({
          where: {
            campaignId,
            status: "pending",
          },
          orderBy: { orderIndex: "asc" },
        });

        if (!recipient) {
          // All pending recipients processed!
          console.log(`[Worker] All recipients processed for campaign ${campaignId}.`);
          break;
        }

        // Atomically mark recipient as 'sending'
        await prisma.recipient.update({
          where: { id: recipient.id },
          data: { status: "sending", attempts: recipient.attempts + 1 },
        });

        console.log(
          `[Worker] Processing recipient ${recipient.orderIndex + 1}/${campaign.totalRecipients}: ${recipient.email}`
        );

        let sendSuccess = false;
        let messageId: string | null = null;
        let finalErrorCode: string | null = null;
        let finalErrorMessage: string | null = null;
        let isAmbiguous = false;

        if (campaign.isDryRun) {
          // Simulate sending delay
          await sleep(Math.min(1000, delayMs));
          sendSuccess = true;
          messageId = `dryrun_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        } else {
          // Real sending via Gmail API
          let attempts = 0;
          const maxRetries = 3;

          while (attempts <= maxRetries) {
            attempts++;
            try {
              // Construct MIME message
              const rawMime = await buildRawMimeMessage({
                from: senderEmail,
                to: recipient.email,
                subject: campaign.subject,
                bodyText: campaign.bodyText,
                bodyHtml: campaign.bodyHtml,
                isHtml: campaign.isHtml,
                attachments: campaign.attachments.map((att) => ({
                  filename: att.filename,
                  filePath: path.resolve(process.env.UPLOAD_DIR || "./private-uploads", att.storedFilename),
                  mimeType: att.mimeType,
                })),
              });

              // Send through Gmail API users.messages.send
              const res = await gmailClientInstance.users.messages.send({
                userId: "me",
                requestBody: {
                  raw: rawMime,
                },
              });

              if (res.data && res.data.id) {
                sendSuccess = true;
                messageId = res.data.id;
                break;
              }
              throw new Error("Gmail API accepted the request but returned no message ID.");
            } catch (err: any) {
              console.error(
                `[Worker] Attempt ${attempts} error sending to ${recipient.email}:`,
                err.message || err
              );

              if (isAmbiguousNetworkError(err)) {
                // Ambiguous network outcome: socket closed mid-stream, could be sent or not.
                isAmbiguous = true;
                finalErrorCode = "AMBIGUOUS_NETWORK_OUTCOME";
                finalErrorMessage =
                  "Network connection was interrupted during dispatch. Delivery outcome is ambiguous; flagged for review to prevent duplicate delivery.";
                break;
              }

              if (isTransientError(err) && attempts <= maxRetries) {
                const backoffMs = calculateJitteredBackoff(attempts);
                console.log(`[Worker] Transient error encountered. Retrying in ${backoffMs}ms...`);
                await sleep(backoffMs);
                continue;
              }

              // Permanent error (e.g. 400 Bad Request, invalid recipient, quota exceeded)
              finalErrorCode = err.code || err.status ? String(err.code || err.status) : "GMAIL_API_ERROR";
              finalErrorMessage = err.message || "Failed to send email via Gmail API.";
              break;
            }
          }
        }

        // Persist recipient status
        if (sendSuccess && messageId) {
          await prisma.recipient.update({
            where: { id: recipient.id },
            data: {
              status: "sent",
              gmailMessageId: messageId,
              sentAt: new Date(),
              errorCode: null,
              errorMessage: null,
            },
          });
        } else if (isAmbiguous) {
          await prisma.recipient.update({
            where: { id: recipient.id },
            data: {
              status: "needs_review",
              errorCode: finalErrorCode,
              errorMessage: finalErrorMessage,
            },
          });
        } else {
          await prisma.recipient.update({
            where: { id: recipient.id },
            data: {
              status: "failed",
              errorCode: finalErrorCode,
              errorMessage: finalErrorMessage,
            },
          });
        }

        // Sync campaign counters
        await this.syncCampaignCounters(campaignId);

        // Check if status changed while sending (e.g. user pressed Pause/Cancel)
        const checkStatus = await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true },
        });
        if (checkStatus?.status === "paused" || checkStatus?.status === "cancelled") {
          console.log(`[Worker] Campaign ${campaignId} was ${checkStatus.status} after sending to ${recipient.email}.`);
          break;
        }

        // Check if there are more pending recipients before waiting delay
        const morePending = await prisma.recipient.count({
          where: { campaignId, status: "pending" },
        });

        if (morePending === 0) {
          console.log(`[Worker] All recipients processed for campaign ${campaignId}. Finalizing immediately.`);
          break;
        }

        // Enforce configured delay before selecting next recipient
        console.log(`[Worker] Waiting delay of ${campaign.delaySeconds}s before next recipient...`);
        await sleep(delayMs);
      }

      // Check if campaign is finished
      const remainingPending = await prisma.recipient.count({
        where: { campaignId, status: "pending" },
      });

      const currentCamp = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true, failedCount: true, needsReviewCount: true },
      });

      if (remainingPending === 0 && (currentCamp?.status === "running" || currentCamp?.status === "queued")) {
        const hasErrors = (currentCamp.failedCount || 0) > 0 || (currentCamp.needsReviewCount || 0) > 0;
        const terminalStatus = hasErrors ? "completed_with_errors" : "completed";

        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: terminalStatus,
            completedAt: new Date(),
          },
        });
        console.log(`[Worker] Campaign ${campaignId} finalized as '${terminalStatus}'.`);
      }
    } finally {
      await this.releaseLease(campaignId);
    }
  }

  /**
   * Main worker polling tick.
   * Checks for queued campaigns or campaigns that were paused and resumed.
   */
  async tick(): Promise<void> {
    // Look for campaigns queued or running that don't have an active lease
    const eligibleCampaign = await prisma.campaign.findFirst({
      where: {
        status: { in: ["queued", "running"] },
      },
      orderBy: { createdAt: "asc" },
    });

    if (eligibleCampaign) {
      await this.processCampaign(eligibleCampaign.id);
    }
  }

  /**
   * Starts the persistent polling loop.
   */
  async start(): Promise<void> {
    this.isRunning = true;
    console.log(`[Worker] Started persistent sending worker (PID ${process.pid}, ID: ${WORKER_ID})`);

    await this.recoverOrphanedTasks();

    while (this.isRunning) {
      try {
        await this.tick();
      } catch (err) {
        console.error("[Worker] Error in worker tick loop:", err);
      }
      // Poll every 3 seconds when idle
      await sleep(3000);
    }
  }

  stop(): void {
    console.log("[Worker] Stopping worker...");
    this.isRunning = false;
    this.stopHeartbeat();
  }
}
