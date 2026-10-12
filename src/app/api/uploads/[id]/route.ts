import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import fs from "node:fs/promises";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachment = await prisma.campaignAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
    }

    // Try deleting file from disk
    try {
      await fs.unlink(attachment.filePath);
    } catch {
      // Ignore if file was already removed
    }

    await prisma.campaignAttachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Attachment Delete Error]:", err);
    return NextResponse.json({ error: "Failed to delete attachment.", details: err.message }, { status: 500 });
  }
}
