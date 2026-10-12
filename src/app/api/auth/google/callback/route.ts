import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client, verifyOAuthState } from "@/lib/auth/oauth";
import { saveAuthorizedAccount } from "@/lib/auth/token-service";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (error) {
    console.error("[OAuth Callback Error from Google]:", error);
    return NextResponse.redirect(`${appUrl}/settings?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/settings?auth_error=${encodeURIComponent("Missing authorization code or state.")}`
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!storedState || storedState !== state || !verifyOAuthState(state)) {
    return NextResponse.redirect(
      `${appUrl}/settings?auth_error=${encodeURIComponent("Invalid or expired OAuth state (CSRF check failed).")}`
    );
  }

  // Clear state cookie
  cookieStore.delete("oauth_state");

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // In cases where consent was previously granted, Google might not send a new refresh token
      // Prompt='consent' in auth URL helps ensure it is provided.
      return NextResponse.redirect(
        `${appUrl}/settings?auth_error=${encodeURIComponent(
          "No refresh token was provided by Google. Please disconnect app permissions at myaccount.google.com/permissions and retry."
        )}`
      );
    }

    // Set credentials temporarily to fetch the account's email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      throw new Error("Unable to identify email address associated with the authorized account.");
    }

    // Save account securely with AES-256-GCM encrypted refresh token
    await saveAuthorizedAccount({
      email,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope || "https://www.googleapis.com/auth/gmail.send",
    });

    return NextResponse.redirect(`${appUrl}/settings?auth=success&email=${encodeURIComponent(email)}`);
  } catch (err: any) {
    console.error("[OAuth Token Exchange Error]:", err);
    return NextResponse.redirect(
      `${appUrl}/settings?auth_error=${encodeURIComponent(err.message || "OAuth exchange failed.")}`
    );
  }
}
