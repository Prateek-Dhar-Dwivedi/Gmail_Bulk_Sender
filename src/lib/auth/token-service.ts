import { google } from "googleapis";
import { prisma } from "@/lib/db/prisma";
import { encryptToken, decryptToken } from "@/lib/security/crypto";
import { getOAuth2Client } from "@/lib/auth/oauth";
import type { AuthStatusResponse } from "@/types";

/**
 * Retrieves the currently active connected Gmail account metadata.
 * Never returns access tokens, refresh tokens, or secrets.
 */
export async function getActiveGmailAccount(): Promise<AuthStatusResponse> {
  const account = await prisma.gmailAccount.findFirst({
    where: { isConnected: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!account) {
    return {
      isConnected: false,
      email: null,
      connectedAt: null,
    };
  }

  return {
    isConnected: true,
    email: account.email,
    connectedAt: account.createdAt.toISOString(),
  };
}

/**
 * Saves or updates an authorized Gmail account with an AES-256-GCM encrypted refresh token.
 */
export async function saveAuthorizedAccount(params: {
  email: string;
  refreshToken: string;
  accessToken?: string | null;
  expiryDate?: number | null;
  scope: string;
}) {
  const { email, refreshToken, accessToken, expiryDate, scope } = params;
  const encryptedRefreshToken = encryptToken(refreshToken);

  return prisma.gmailAccount.upsert({
    where: { email },
    update: {
      encryptedRefreshToken,
      accessToken: accessToken || null,
      tokenExpiry: expiryDate ? new Date(expiryDate) : null,
      scope,
      isConnected: true,
    },
    create: {
      email,
      encryptedRefreshToken,
      accessToken: accessToken || null,
      tokenExpiry: expiryDate ? new Date(expiryDate) : null,
      scope,
      isConnected: true,
    },
  });
}

/**
 * Instantiates an authenticated Google Gmail API client using decrypted refresh token.
 */
export async function getAuthenticatedGmailClient() {
  const account = await prisma.gmailAccount.findFirst({
    where: { isConnected: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!account) {
    throw new Error("No connected Gmail account found. Please connect your Gmail account.");
  }

  const refreshToken = decryptToken(account.encryptedRefreshToken);
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: account.accessToken || undefined,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  return { gmail, account, oauth2Client };
}

/**
 * Disconnects the active Gmail account and revokes the OAuth token with Google.
 */
export async function disconnectGmailAccount() {
  const account = await prisma.gmailAccount.findFirst({
    where: { isConnected: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!account) {
    return { success: true };
  }

  try {
    const refreshToken = decryptToken(account.encryptedRefreshToken);
    const oauth2Client = getOAuth2Client();
    await oauth2Client.revokeToken(refreshToken);
  } catch (err) {
    // If token was already revoked on Google's end, proceed with local cleanup
    console.warn("Notice during token revocation:", err instanceof Error ? err.message : err);
  }

  await prisma.gmailAccount.update({
    where: { id: account.id },
    data: { isConnected: false },
  });

  return { success: true };
}
