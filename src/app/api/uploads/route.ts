import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB per file
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./private-uploads");

// Basic dangerous extensions filter
const DISALLOWED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".com", ".vbs", ".js", ".msi"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 15MB.` },
        { status: 400 }
      );
    }

    const rawFilename = file.name;
    const ext = path.extname(rawFilename).toLowerCase();

    if (DISALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File extension '${ext}' is not permitted for security reasons.` },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal
    const safeBaseName = path.basename(rawFilename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedFilename = `${crypto.randomUUID()}_${safeBaseName}`;

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const targetFilePath = path.join(UPLOAD_DIR, storedFilename);

    // Write file to private disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetFilePath, buffer);

    // Save attachment metadata in DB
    const attachment = await prisma.campaignAttachment.create({
      data: {
        filename: safeBaseName,
        storedFilename,
        filePath: targetFilePath,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
    });

    return NextResponse.json({
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size,
      mimeType: attachment.mimeType,
    });
  } catch (err: any) {
    console.error("[Upload Error]:", err);
    return NextResponse.json({ error: "Failed to upload file.", details: err.message }, { status: 500 });
  }
}
