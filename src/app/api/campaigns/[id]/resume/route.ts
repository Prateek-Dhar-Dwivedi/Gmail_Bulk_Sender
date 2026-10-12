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

    if (campaign.status !== "paused") {
      return NextResponse.json(
        { error: `Cannot resume campaign with status '${campaign.status}'` },
        { status: 400 }
      );
    }

    // Check if another campaign became active while this one was paused
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
          error: "Another campaign is currently running for this Gmail account. Cannot resume.",
          activeCampaignId: activeRunning.id,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: "queued" },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: any) {
    console.error("[Resume Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to resume campaign", details: err.message }, { status: 500 });
  }
}
