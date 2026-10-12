"use client";

import { useState } from "react";
import type { RecipientItem, RecipientStatus } from "@/types";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Search, RefreshCw, AlertCircle } from "lucide-react";

interface RecipientTableProps {
  recipients: RecipientItem[];
}

export function RecipientTable({ recipients }: RecipientTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = recipients.filter((rec) => {
    const matchesSearch = rec.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || rec.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RecipientStatus) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Sent
          </span>
        );
      case "sending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 animate-pulse">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            Sending...
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            Pending
          </span>
        );
      case "needs_review":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Needs Review
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient emails..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All statuses ({recipients.length})</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="sending">Sending</option>
            <option value="needs_review">Needs Review</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Recipient Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">Recipient Address</th>
              <th className="py-2.5 px-4 w-32">Status</th>
              <th className="py-2.5 px-4 w-44">Gmail Message ID</th>
              <th className="py-2.5 px-4 w-40">Dispatched Time</th>
              <th className="py-2.5 px-4">Details / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No recipient records found matching current filter.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-mono">
                    {rec.orderIndex + 1}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                    {rec.email}
                  </td>
                  <td className="py-2.5 px-4">{getStatusBadge(rec.status)}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[160px]">
                    {rec.gmailMessageId || "—"}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {rec.sentAt ? new Date(rec.sentAt).toLocaleTimeString() : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {rec.errorMessage ? (
                      <span
                        className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-100 max-w-xs truncate"
                        title={rec.errorMessage}
                      >
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {rec.errorMessage}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
