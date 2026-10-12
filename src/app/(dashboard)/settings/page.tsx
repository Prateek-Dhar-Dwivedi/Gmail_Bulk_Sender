"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
  Key,
  ExternalLink,
  Trash2,
  Info,
  Server,
  Lock,
} from "lucide-react";
import type { AuthStatusResponse } from "@/types";

export default function SettingsPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setAuthStatus(data);
    } catch {
      setAuthStatus({ isConnected: false, email: null, connectedAt: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check query params for auth callbacks
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      setFeedback({
        type: "success",
        message: `Successfully connected Gmail account (${params.get("email") || "authorized"}).`,
      });
    } else if (params.get("auth_error")) {
      setFeedback({
        type: "error",
        message: `OAuth authorization failed: ${params.get("auth_error")}`,
      });
    }
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Gmail account?")) return;

    setDisconnecting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/auth/disconnect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect account");

      setFeedback({ type: "success", message: "Gmail account disconnected successfully." });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Settings & Account Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your connected Gmail account, security settings, and sending limits.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Gmail OAuth Connection Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                authStatus?.isConnected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Google OAuth 2.0 Connection</h2>
              <p className="text-xs text-slate-500">
                Direct integration with Gmail API (users.messages.send)
              </p>
            </div>
          </div>

          <div>
            {authStatus?.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Disconnected
              </span>
            )}
          </div>
        </div>

        {authStatus?.isConnected ? (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Authorized Account:</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{authStatus.email}</p>
              </div>
              <div>
                <span className="text-slate-500">Connected Since:</span>
                <p className="text-slate-700 mt-0.5">
                  {authStatus.connectedAt
                    ? new Date(authStatus.connectedAt).toLocaleDateString()
                    : "Active"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                disabled={disconnecting}
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{disconnecting ? "Disconnecting..." : "Disconnect Gmail Account"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
            <p className="text-slate-600">
              No Gmail account is currently linked. Click below to authorize your personal Gmail
              account using Google’s official OAuth 2.0 authorization screen.
            </p>
            <div>
              <a
                href="/api/auth/google"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Key className="w-4 h-4" />
                <span>Connect with Google OAuth</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Sending Quotas & Google Policies */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">Gmail Sending Quotas & Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h3 className="font-semibold text-slate-900">Free @gmail.com Accounts</h3>
            <p className="text-slate-600">
              Google enforces a hard daily limit of <strong>500 recipients / rolling 24 hours</strong> for personal Gmail accounts.
            </p>
            <p className="text-slate-500 text-[11px]">
              Recommended interval: 10–15 seconds between emails to maintain sender reputation.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <h3 className="font-semibold text-slate-900">Google Workspace Accounts</h3>
            <p className="text-slate-600">
              Google Workspace (paid custom domain) accounts support up to <strong>2,000 recipients / rolling 24 hours</strong>.
            </p>
            <p className="text-slate-500 text-[11px]">
              Sending limits apply across all clients (web, mobile, and API combined).
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <strong>Anti-Abuse Policy Notice:</strong> This application strictly adheres to Google policies. It does not bypass quotas, rotate accounts, or generate unsolicited spam. Messages are sent sequentially with an enforced minimum delay.
        </div>
      </div>

      {/* Security Architecture Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">Security Architecture & Privacy</h2>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong>AES-256-GCM Token Encryption:</strong> Refresh tokens are encrypted at rest in the SQLite database using a 256-bit server-side key (`TOKEN_ENCRYPTION_KEY`). Tokens are never sent to the browser.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong>Private Attachment Isolation:</strong> Uploaded files are stored in a private directory (`./private-uploads`) completely inaccessible to public HTTP requests.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong>CSV Injection Defense:</strong> All CSV exports are sanitized against spreadsheet formula injection attacks (`=`, `+`, `-`, `@`).
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong>Persistent Queue Worker:</strong> Long-running sequential dispatching is processed by an isolated Node.js worker process (`worker/index.ts`), preventing HTTP timeout vulnerabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
