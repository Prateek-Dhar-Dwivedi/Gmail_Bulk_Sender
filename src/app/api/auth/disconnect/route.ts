import { NextResponse } from "next/server";
import { disconnectGmailAccount } from "@/lib/auth/token-service";

export async function POST() {
  try {
    await disconnectGmailAccount();
    return NextResponse.json({ success: true, message: "Gmail account successfully disconnected." });
  } catch (err: any) {
    console.error("[Disconnect Error]:", err);
    return NextResponse.json(
      { error: "Failed to disconnect Gmail account", details: err.message },
      { status: 500 }
    );
  }
}
