"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, History, ExternalLink, PlusCircle } from "lucide-react";
import type { CampaignSummary } from "@/types";

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch((err) => console.error("Error loading campaigns:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Campaign History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit logs, delivery statistics, and downloadable CSV reports for all past dispatches.
          </p>
        </div>

        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading past campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No campaigns found</p>
            <p className="text-xs text-slate-400">
              When you launch an email campaign, its history and CSV export will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-28 text-center">Recipients</th>
                  <th className="py-3 px-4 w-28 text-center">Sent</th>
                  <th className="py-3 px-4 w-28 text-center">Failed</th>
                  <th className="py-3 px-4 w-36">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
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
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">
                      {camp.totalRecipients}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                      {camp.sentCount}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-rose-600">
                      {camp.failedCount}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/campaigns/${camp.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          View
                        </Link>
                        <a
                          href={`/api/campaigns/${camp.id}/export`}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
                          title="Export CSV report"
                        >
                          <Download className="w-3 h-3 text-slate-400" />
                          CSV
                        </a>
                      </div>
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
