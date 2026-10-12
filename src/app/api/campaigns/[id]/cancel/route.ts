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

    if (
      campaign.status === "completed" ||
      campaign.status === "completed_with_errors" ||
      campaign.status === "cancelled"
    ) {
      return NextResponse.json(
        { error: `Campaign is already in terminal state '${campaign.status}'` },
        { status: 400 }
      );
    }

    // Cancel remaining pending recipients and mark campaign cancelled
    const result = await prisma.$transaction(async (tx) => {
      await tx.recipient.updateMany({
        where: { campaignId: id, status: "pending" },
        data: { status: "cancelled" },
      });

      const updated = await tx.campaign.update({
        where: { id },
        data: {
          status: "cancelled",
          completedAt: new Date(),
        },
      });

      // Clear any worker lease
      await tx.workerLease.deleteMany({
        where: { campaignId: id },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Campaign cancelled. Any in-flight request will finish, and all remaining pending emails are cancelled.",
      campaign: result,
    });
  } catch (err: any) {
    console.error("[Cancel Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to cancel campaign", details: err.message }, { status: 500 });
  }
}
