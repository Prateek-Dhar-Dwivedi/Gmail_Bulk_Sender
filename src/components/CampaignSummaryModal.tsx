"use client";

import { CheckCircle2, AlertTriangle, Download, PlusCircle, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { CampaignStatus } from "@/types";

interface CampaignSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  campaignId: string;
  subject: string;
  status: CampaignStatus;
  isDryRun: boolean;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  needsReviewCount: number;
}

export function CampaignSummaryModal({
  isOpen,
  onClose,
  onRetry,
  campaignId,
  subject,
  status,
  isDryRun,
  totalRecipients,
  sentCount,
  failedCount,
  needsReviewCount,
}: CampaignSummaryModalProps) {
  if (!isOpen) return null;

  const hasIssues = failedCount > 0 || needsReviewCount > 0;
  const successRate =
    totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`p-6 border-b flex items-start justify-between ${
            hasIssues
              ? "bg-amber-50/70 border-amber-100"
              : "bg-emerald-50/70 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                hasIssues
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {hasIssues ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>
                  {isDryRun
                    ? "Dry Run Simulation Finished!"
                    : hasIssues
                    ? "Campaign Dispatch Completed with Notes"
                    : "Campaign Finished Successfully!"}
                </span>
                {!hasIssues && !isDryRun && (
                  <img src="/icon.svg" alt="MailSprint Logo" className="w-4 h-4 rounded inline-block" />
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All {totalRecipients} recipient addresses have been processed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Campaign Subject
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
              {subject}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] font-medium text-slate-500">Processed</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {totalRecipients}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-[11px] font-medium text-emerald-700">Delivered</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">
                {sentCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-center">
              <span className="text-[11px] font-medium text-rose-700">Failed</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">
                {failedCount}
              </p>
            </div>
          </div>

          {/* Success rate bar */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Delivery Success Rate:</span>
              <span
                className={
                  successRate >= 90
                    ? "text-emerald-700 font-bold"
                    : "text-amber-700 font-bold"
                }
              >
                {successRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {hasIssues && onRetry && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    onRetry();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry {failedCount + needsReviewCount} Failed / Incomplete Emails</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Already delivered emails ({sentCount}) are safely skipped.
                </p>
              </div>
            )}

            <a
              href={`/api/campaigns/${campaignId}/export`}
              download
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Audit Report</span>
            </a>

            <div className="flex items-center gap-2">
              <Link
                href="/campaigns/new"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Start New Campaign</span>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
              >
                View Details Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
