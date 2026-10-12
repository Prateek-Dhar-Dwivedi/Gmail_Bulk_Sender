import { NextResponse } from "next/server";
import { getActiveGmailAccount } from "@/lib/auth/token-service";

export async function GET() {
  try {
    const status = await getActiveGmailAccount();
    return NextResponse.json(status);
  } catch (err: any) {
    console.error("[Auth Status Error]:", err);
    return NextResponse.json(
      { isConnected: false, email: null, connectedAt: null, error: err.message },
      { status: 500 }
    );
  }
}
