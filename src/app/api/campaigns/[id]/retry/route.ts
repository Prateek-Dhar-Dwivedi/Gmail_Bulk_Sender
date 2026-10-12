import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if another campaign is currently running for this Gmail account
    const activeRunning = await prisma.campaign.findFirst({
      where: {
        gmailAccountId: campaign.gmailAccountId,
        status: { in: ["running", "queued"] },
        id: { not: id },
      },
    });

    if (activeRunning) {
      return NextResponse.json(
        {
          error: "Another campaign is currently active for this Gmail account. Only one active campaign is permitted at a time.",
          activeCampaignId: activeRunning.id,
        },
        { status: 409 }
      );
    }

    // Find all recipients that failed, need review, or were cancelled
    // GUARANTEE: NEVER RESEND TO RECIPIENTS WHOSE STATUS IS 'sent'!
    const eligibleRecipients = await prisma.recipient.findMany({
      where: {
        campaignId: id,
        status: { in: ["failed", "needs_review", "cancelled"] },
      },
    });

    if (eligibleRecipients.length === 0) {
      return NextResponse.json(
        {
          error: "All recipients in this campaign have already been delivered successfully. No emails need re-sending.",
        },
        { status: 400 }
      );
    }

    // Atomically reset only failed/uncompleted recipients to 'pending' and re-queue campaign
    await prisma.$transaction(async (tx) => {
      // 1. Reset ONLY failed / needs_review / cancelled recipients to 'pending'
      await tx.recipient.updateMany({
        where: {
          campaignId: id,
          status: { in: ["failed", "needs_review", "cancelled"] },
        },
        data: {
          status: "pending",
          errorCode: null,
          errorMessage: null,
        },
      });

      // 2. Re-queue the campaign
      await tx.campaign.update({
        where: { id },
        data: {
          status: "queued",
          completedAt: null,
          pendingCount: eligibleRecipients.length,
          failedCount: 0,
          needsReviewCount: 0,
        },
      });

      // 3. Clear any stale lease
      await tx.workerLease.deleteMany({
        where: { campaignId: id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Re-queued ${eligibleRecipients.length} failed/uncompleted emails. Completed emails are safely skipped.`,
      retriedCount: eligibleRecipients.length,
    });
  } catch (err: any) {
    console.error("[Retry Campaign Error]:", err);
    return NextResponse.json(
      { error: "Failed to retry campaign", details: err.message },
      { status: 500 }
    );
  }
}
