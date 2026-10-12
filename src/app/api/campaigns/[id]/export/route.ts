import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildSafeCsv } from "@/lib/security/csv";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        recipients: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const headers = [
      "Order",
      "Recipient Email",
      "Status",
      "Sent At",
      "Gmail Message ID",
      "Error Code",
      "Error Message",
    ];

    const rows = campaign.recipients.map((rec) => [
      rec.orderIndex + 1,
      rec.email,
      rec.status,
      rec.sentAt ? rec.sentAt.toISOString() : "",
      rec.gmailMessageId || "",
      rec.errorCode || "",
      rec.errorMessage || "",
    ]);

    const csvContent = buildSafeCsv(headers, rows);
    const sanitizedTitle = campaign.subject
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const filename = `campaign_${sanitizedTitle}_${id.substring(0, 8)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[Export CSV Error]:", err);
    return NextResponse.json({ error: "Failed to export campaign report", details: err.message }, { status: 500 });
  }
}
