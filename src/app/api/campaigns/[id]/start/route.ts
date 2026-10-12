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

    if (campaign.status !== "draft" && campaign.status !== "paused") {
      return NextResponse.json(
        { error: `Cannot start campaign with status '${campaign.status}'` },
        { status: 400 }
      );
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

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: "queued",
        startedAt: campaign.startedAt || new Date(),
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: any) {
    console.error("[Start Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to start campaign", details: err.message }, { status: 500 });
  }
}
