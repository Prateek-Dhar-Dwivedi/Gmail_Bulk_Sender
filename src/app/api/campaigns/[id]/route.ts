import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        attachments: {
          select: {
            id: true,
            filename: true,
            size: true,
            mimeType: true,
          },
        },
        recipients: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (err: any) {
    console.error("[Get Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to fetch campaign", details: err.message }, { status: 500 });
  }
}
