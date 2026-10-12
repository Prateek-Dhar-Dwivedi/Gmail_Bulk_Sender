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

    if (campaign.status !== "running" && campaign.status !== "queued") {
      return NextResponse.json(
        { error: `Cannot pause campaign with status '${campaign.status}'` },
        { status: 400 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: "paused" },
    });

    return NextResponse.json({
      success: true,
      message: "Pause signal recorded. In-flight operations will settle and no new emails will be sent.",
      campaign: updated,
    });
  } catch (err: any) {
    console.error("[Pause Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to pause campaign", details: err.message }, { status: 500 });
  }
}
