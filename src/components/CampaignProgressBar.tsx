"use client";

import type { CampaignStatus } from "@/types";
import { CheckCircle2, AlertCircle, Clock, PauseCircle, PlayCircle, XCircle, AlertTriangle } from "lucide-react";

interface CampaignProgressBarProps {
  status: CampaignStatus;
  isDryRun: boolean;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  needsReviewCount: number;
  pendingCount: number;
}

export function CampaignProgressBar({
  status,
  isDryRun,
  totalRecipients,
  sentCount,
  failedCount,
  needsReviewCount,
  pendingCount,
}: CampaignProgressBarProps) {
  const completedItems = sentCount + failedCount + needsReviewCount;
  const percentage = totalRecipients > 0 ? Math.min(100, Math.round((completedItems / totalRecipients) * 100)) : 0;

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Running
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
            Paused
          </span>
        );
      case "queued":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Queued
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case "completed_with_errors":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Completed with Issues
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">Campaign Dispatch Progress</h2>
          {isDryRun && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
              DRY RUN
            </span>
          )}
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{percentage}% Processed</span>
          <span>
            {completedItems} of {totalRecipients} emails
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${totalRecipients ? (sentCount / totalRecipients) * 100 : 0}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${totalRecipients ? (needsReviewCount / totalRecipients) * 100 : 0}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{ width: `${totalRecipients ? (failedCount / totalRecipients) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-medium text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{totalRecipients}</p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <p className="text-[11px] font-medium text-emerald-700">Sent</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{sentCount}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-medium text-slate-500">Pending</p>
          <p className="text-lg font-bold text-slate-700 mt-0.5">{pendingCount}</p>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
          <p className="text-[11px] font-medium text-rose-700">Failed</p>
          <p className="text-lg font-bold text-rose-700 mt-0.5">{failedCount}</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-medium text-amber-800">Needs Review</p>
          <p className="text-lg font-bold text-amber-800 mt-0.5">{needsReviewCount}</p>
        </div>
      </div>
    </div>
  );
}
