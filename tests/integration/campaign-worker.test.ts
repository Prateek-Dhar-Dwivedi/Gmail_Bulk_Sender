import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { CampaignWorker } from "../../worker/campaign-worker";

describe("Campaign Worker Integration", () => {
  let worker: CampaignWorker;
  let testAccountId: string;

  beforeEach(async () => {
    worker = new CampaignWorker();

    // Clean up test database tables
    await prisma.workerLease.deleteMany();
    await prisma.recipient.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.gmailAccount.deleteMany();

    // Create a mock GmailAccount for integration testing
    const account = await prisma.gmailAccount.create({
      data: {
        email: "test-sender@example.com",
        encryptedRefreshToken: "mock_encrypted_refresh_token",
        scope: "https://www.googleapis.com/auth/gmail.send",
        isConnected: true,
      },
    });
    testAccountId = account.id;
  });

  afterAll(async () => {
    worker.stop();
    await prisma.$disconnect();
  });

  it("recovers orphaned tasks: marks recipients stuck in 'sending' as 'needs_review' on startup", async () => {
    // Create a campaign with an in-flight recipient simulating a crash
    const campaign = await prisma.campaign.create({
      data: {
        gmailAccountId: testAccountId,
        subject: "Interrupted Campaign",
        bodyText: "Body text",
        delaySeconds: 2,
        status: "running",
        totalRecipients: 2,
        pendingCount: 1,
        sentCount: 0,
        recipients: {
          create: [
            {
              email: "interrupted@example.com",
              orderIndex: 0,
              status: "sending",
            },
            {
              email: "waiting@example.com",
              orderIndex: 1,
              status: "pending",
            },
          ],
        },
      },
    });

    // Run recovery
    await worker.recoverOrphanedTasks();

    const recoveredRecipient = await prisma.recipient.findFirst({
      where: { email: "interrupted@example.com" },
    });

    expect(recoveredRecipient?.status).toBe("needs_review");
    expect(recoveredRecipient?.errorCode).toBe("WORKER_RESTARTED_IN_FLIGHT");

    // The other recipient should still be pending
    const waitingRecipient = await prisma.recipient.findFirst({
      where: { email: "waiting@example.com" },
    });
    expect(waitingRecipient?.status).toBe("pending");
  });

  it("executes a dry-run campaign sequentially and completes it", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        gmailAccountId: testAccountId,
        subject: "Dry Run Test Campaign",
        bodyText: "Hello world!",
        delaySeconds: 2,
        isDryRun: true,
        status: "queued",
        totalRecipients: 2,
        pendingCount: 2,
        recipients: {
          create: [
            { email: "user1@example.com", orderIndex: 0, status: "pending" },
            { email: "user2@example.com", orderIndex: 1, status: "pending" },
          ],
        },
      },
    });

    // Process the campaign through worker
    await worker.processCampaign(campaign.id);

    const updated = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { recipients: { orderBy: { orderIndex: "asc" } } },
    });

    expect(updated?.status).toBe("completed");
    expect(updated?.sentCount).toBe(2);
    expect(updated?.pendingCount).toBe(0);
    expect(updated?.recipients[0].status).toBe("sent");
    expect(updated?.recipients[0].gmailMessageId).toContain("dryrun_");
    expect(updated?.recipients[1].status).toBe("sent");
    expect(updated?.recipients[1].gmailMessageId).toContain("dryrun_");
  });

  it("respects pause signal and stops processing further pending recipients", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        gmailAccountId: testAccountId,
        subject: "Pause Test Campaign",
        bodyText: "Testing pause",
        delaySeconds: 2,
        isDryRun: true,
        status: "paused", // Already paused
        totalRecipients: 2,
        pendingCount: 2,
        recipients: {
          create: [
            { email: "paused1@example.com", orderIndex: 0, status: "pending" },
            { email: "paused2@example.com", orderIndex: 1, status: "pending" },
          ],
        },
      },
    });

    await worker.processCampaign(campaign.id);

    const recipients = await prisma.recipient.findMany({
      where: { campaignId: campaign.id },
    });

    // None should have been processed
    expect(recipients.every((r) => r.status === "pending")).toBe(true);
  });
});
