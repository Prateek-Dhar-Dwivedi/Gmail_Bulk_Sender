import { google } from "googleapis";
import { generateOAuthState, verifyOAuthState } from "@/lib/security/csrf";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables. Configure them in .env to enable Gmail OAuth."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google OAuth 2.0 authorization URL with CSRF protection and offline access.
 */
export function generateAuthUrl(): { url: string; state: string } {
  const oauth2Client = getOAuth2Client();
  const state = generateOAuthState();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // Force consent so Google issues a refresh_token
    scope: GMAIL_SCOPES,
    state,
  });

  return { url, state };
}

export { verifyOAuthState };
