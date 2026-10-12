import { NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/auth/oauth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const { url, state } = generateAuthUrl();
    const cookieStore = await cookies();

    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error("[OAuth Init Error]:", err);
    return NextResponse.json(
      {
        error: "Failed to initialize Google OAuth flow",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
