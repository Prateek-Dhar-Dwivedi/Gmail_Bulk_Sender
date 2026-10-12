import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateCampaignSchema } from "@/lib/validation/campaign-schema";
import { parseRecipients } from "@/lib/validation/email-parser";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        subject: true,
        status: true,
        isDryRun: true,
        delaySeconds: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
        needsReviewCount: true,
        pendingCount: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ campaigns });
  } catch (err: any) {
    console.error("[Get Campaigns Error]:", err);
    return NextResponse.json({ error: "Failed to fetch campaigns", details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateCampaignSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const {
      subject,
      bodyText,
      bodyHtml,
      isHtml,
      isDryRun,
      delaySeconds,
      recipientInput,
      attachmentIds,
    } = parseResult.data;

    // Parse and validate recipients
    const analysis = parseRecipients(recipientInput);
    if (analysis.valid.length === 0) {
      return NextResponse.json(
        {
          error: "No valid recipient email addresses found.",
          invalid: analysis.invalid,
        },
        { status: 400 }
      );
    }

    // Find active Gmail account
    let activeAccount = await prisma.gmailAccount.findFirst({
      where: { isConnected: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!activeAccount) {
      if (isDryRun) {
        // Create or find dummy account for Dry Run mode if none is connected
        activeAccount = await prisma.gmailAccount.upsert({
          where: { email: "dryrun-simulator@example.com" },
          update: { isConnected: true },
          create: {
            email: "dryrun-simulator@example.com",
            encryptedRefreshToken: "dryrun-encrypted-token",
            scope: "https://www.googleapis.com/auth/gmail.send",
            isConnected: true,
          },
        });
      } else {
        return NextResponse.json(
          { error: "No Gmail account is connected. Please connect your Gmail account in Settings before sending real emails." },
          { status: 400 }
        );
      }
    }

    // Create Campaign and Recipients in transaction
    const newCampaign = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.create({
        data: {
          gmailAccountId: activeAccount.id,
          subject,
          bodyText,
          bodyHtml: bodyHtml || null,
          isHtml,
          isDryRun,
          delaySeconds,
          status: "draft",
          totalRecipients: analysis.valid.length,
          pendingCount: analysis.valid.length,
          sentCount: 0,
          failedCount: 0,
          needsReviewCount: 0,
        },
      });

      // Insert recipients strictly in original order
      const recipientData = analysis.valid.map((email, index) => ({
        campaignId: campaign.id,
        email,
        orderIndex: index,
        status: "pending",
      }));

      await tx.recipient.createMany({
        data: recipientData,
      });

      // Link attachments to this campaign
      if (attachmentIds && attachmentIds.length > 0) {
        await tx.campaignAttachment.updateMany({
          where: { id: { in: attachmentIds } },
          data: { campaignId: campaign.id },
        });
      }

      return campaign;
    });

    return NextResponse.json({
      success: true,
      campaignId: newCampaign.id,
      totalRecipients: newCampaign.totalRecipients,
      duplicateCount: analysis.duplicates.length,
      invalidCount: analysis.invalid.length,
    });
  } catch (err: any) {
    console.error("[Create Campaign Error]:", err);
    return NextResponse.json({ error: "Failed to create campaign", details: err.message }, { status: 500 });
  }
}
