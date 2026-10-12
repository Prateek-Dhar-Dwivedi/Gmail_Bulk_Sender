import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getAppPassword,
} from "@/lib/security/auth-session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const expectedPassword = getAppPassword();

    // Verify password match
    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: "Incorrect passcode. Please check your APP_PASSWORD." },
        { status: 401 }
      );
    }

    // Generate authenticated session token
    const sessionToken = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
    });

    // Set HttpOnly, Secure, SameSite=Lax cookie for 30 days
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error("[Login Error]:", err);
    return NextResponse.json(
      { error: "Authentication failed", details: err.message },
      { status: 500 }
    );
  }
}
