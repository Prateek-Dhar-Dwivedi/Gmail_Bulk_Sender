import { NextRequest, NextResponse } from "next/server";
import { PreviewCampaignSchema } from "@/lib/validation/campaign-schema";
import { parseRecipients } from "@/lib/validation/email-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PreviewCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid preview request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const recipientAnalysis = parseRecipients(parsed.data.recipientInput || "");

    return NextResponse.json({
      analysis: recipientAnalysis,
      subject: parsed.data.subject || "",
      bodyText: parsed.data.bodyText || "",
    });
  } catch (err: any) {
    console.error("[Campaign Preview Error]:", err);
    return NextResponse.json({ error: "Failed to preview campaign", details: err.message }, { status: 500 });
  }
}
