"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Send,
  History,
} from "lucide-react";
import type { CampaignSummary, AuthStatusResponse } from "@/types";

export default function DashboardPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, campRes] = await Promise.all([
          fetch("/api/auth/status"),
          fetch("/api/campaigns"),
        ]);
        const authData = await authRes.json();
        const campData = await campRes.json();
        setAuthStatus(authData);
        setCampaigns(campData.campaigns || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSentAllTime = campaigns.reduce((acc, c) => acc + c.sentCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            1-by-1 bulk email automation via your authorized personal Gmail account.
          </p>
        </div>

        <Link
          href="/campaigns/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Gmail Account Status Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-lg ${
                authStatus?.isConnected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Gmail Connection</h2>
                {authStatus?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {authStatus?.isConnected
                  ? `Authorized as ${authStatus.email}. Ready for sequential sending.`
                  : "Connect your Google account via OAuth 2.0 to dispatch emails."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authStatus?.isConnected ? (
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Manage Connection
              </Link>
            ) : (
              <a
                href="/api/auth/google"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Connect Gmail
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-500">Total Campaigns</p>
          <p className="text-2xl font-bold text-slate-900">{campaigns.length}</p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-500">Total Emails Dispatched</p>
          <p className="text-2xl font-bold text-emerald-600">{totalSentAllTime}</p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-500">Queue Architecture</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              Node.js Background Worker
            </span>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Recent Campaigns</h2>
          </div>
          {campaigns.length > 0 && (
            <Link
              href="/campaigns/history"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No campaigns created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to send your prepared emails? Paste your recipient addresses, set your subject and body, and launch your first batch.
            </p>
            <div className="pt-2">
              <Link
                href="/campaigns/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create First Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 font-medium">
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Recipients</th>
                  <th className="py-2.5 px-4">Sent / Failed</th>
                  <th className="py-2.5 px-4">Created</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.slice(0, 5).map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      <Link href={`/campaigns/${camp.id}`} className="hover:underline text-blue-600">
                        {camp.subject}
                      </Link>
                      {camp.isDryRun && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                          DRY RUN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {camp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{camp.totalRecipients}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="text-emerald-600 font-semibold">{camp.sentCount}</span> /{" "}
                      <span className="text-rose-600 font-semibold">{camp.failedCount}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="px-2.5 py-1 rounded border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Monitor
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
