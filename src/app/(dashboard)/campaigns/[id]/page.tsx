"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CampaignProgressBar } from "../../../../components/CampaignProgressBar";
import { RecipientTable } from "../../../../components/RecipientTable";
import { CampaignSummaryModal } from "../../../../components/CampaignSummaryModal";
import type { CampaignStatus, RecipientItem, AttachmentItem } from "@/types";
import {
  ArrowLeft,
  Pause,
  Play,
  XCircle,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  PlusCircle,
  RotateCcw,
} from "lucide-react";

interface CampaignDetail {
  id: string;
  subject: string;
  bodyText: string;
  delaySeconds: number;
  isDryRun: boolean;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  needsReviewCount: number;
  pendingCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  attachments: AttachmentItem[];
  recipients: RecipientItem[];
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [summaryModalDismissed, setSummaryModalDismissed] = useState(false);

  // Poll campaign status every 2 seconds while running or queued
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) throw new Error("Failed to load campaign data");
        const data = await res.json();
        setCampaign(data.campaign);

        // Reset summary dismissed flag if campaign is actively running again
        if (data.campaign?.status === "running") {
          setSummaryModalDismissed(false);
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();

    intervalId = setInterval(() => {
      fetchCampaign();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [campaignId]);

  const handleControlAction = async (action: "pause" | "resume" | "cancel") => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} campaign`);
      }
      // Re-fetch immediately
      const refreshRes = await fetch(`/api/campaigns/${campaignId}`);
      const refreshData = await refreshRes.json();
      setCampaign(refreshData.campaign);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retry failed emails");
      }
      setSummaryModalDismissed(true);
      const refreshRes = await fetch(`/api/campaigns/${campaignId}`);
      const refreshData = await refreshRes.json();
      setCampaign(refreshData.campaign);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !campaign) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading campaign status and recipient records...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-rose-600 font-medium">Campaign not found</p>
        <Link href="/" className="text-xs text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isTerminal =
    campaign.status === "completed" ||
    campaign.status === "completed_with_errors" ||
    campaign.status === "cancelled";

  const isFinished = campaign.totalRecipients > 0 && campaign.pendingCount === 0;

  const retriableCount = campaign.recipients
    ? campaign.recipients.filter((r) =>
        ["failed", "needs_review", "cancelled"].includes(r.status)
      ).length
    : campaign.failedCount + campaign.needsReviewCount;

  return (
    <div className="space-y-6">
      {/* Back and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns/history"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{campaign.subject}</span>
              {campaign.isDryRun && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  DRY RUN
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(campaign.createdAt).toLocaleString()} • {campaign.delaySeconds}s delay
            </p>
          </div>
        </div>

        {/* Campaign Queue Controls */}
        <div className="flex items-center gap-2">
          {retriableCount > 0 && !["running", "queued"].includes(campaign.status) && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold shadow-sm transition-colors"
              title="Re-send only failed or uncompleted recipients. Completed emails are safely skipped."
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Retry Failed ({retriableCount})</span>
            </button>
          )}

          {!isTerminal && (
            <>
              {campaign.status === "paused" ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleControlAction("resume")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleControlAction("pause")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleControlAction("cancel")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium shadow-sm transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}

          <a
            href={`/api/campaigns/${campaign.id}/export`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Campaign Finished Summary Report Banner */}
      {isFinished && (
        <div
          className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300 ${
            campaign.failedCount > 0 || campaign.needsReviewCount > 0
              ? "bg-amber-50/90 border-amber-200"
              : "bg-emerald-50/90 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-xl ${
                campaign.failedCount > 0 || campaign.needsReviewCount > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {campaign.isDryRun
                  ? "Dry Run Simulation Finished!"
                  : campaign.failedCount > 0
                  ? "Campaign Dispatch Finished (With Some Delivery Notes)"
                  : "Campaign Finished! All Emails Dispatched 🎉"}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Processed all {campaign.totalRecipients} recipients:{" "}
                <span className="font-semibold text-emerald-700">
                  {campaign.sentCount} sent
                </span>
                {campaign.failedCount > 0 && (
                  <>
                    ,{" "}
                    <span className="font-semibold text-rose-700">
                      {campaign.failedCount} failed
                    </span>
                  </>
                )}
                {campaign.needsReviewCount > 0 && (
                  <>
                    ,{" "}
                    <span className="font-semibold text-amber-700">
                      {campaign.needsReviewCount} needs review
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {retriableCount > 0 && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRetry}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
                title="Re-send only failed or uncompleted recipients. Completed emails are safely skipped."
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Failed ({retriableCount})</span>
              </button>
            )}

            <a
              href={`/api/campaigns/${campaign.id}/export`}
              download
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download CSV Report</span>
            </a>
            <Link
              href="/campaigns/new"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Campaign</span>
            </Link>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <CampaignProgressBar
        status={campaign.status}
        isDryRun={campaign.isDryRun}
        totalRecipients={campaign.totalRecipients}
        sentCount={campaign.sentCount}
        failedCount={campaign.failedCount}
        needsReviewCount={campaign.needsReviewCount}
        pendingCount={campaign.pendingCount}
      />

      {/* Attachments (if any) */}
      {campaign.attachments && campaign.attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 text-xs text-slate-600">
          <Paperclip className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">Attachments ({campaign.attachments.length}):</span>
          <div className="flex flex-wrap gap-2">
            {campaign.attachments.map((att) => (
              <span key={att.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                {att.filename}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Recipient Status Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Recipient Dispatch Status</h3>
        <RecipientTable recipients={campaign.recipients || []} />
      </div>

      {/* Campaign Completion Popup Modal */}
      <CampaignSummaryModal
        isOpen={isFinished && !summaryModalDismissed}
        onClose={() => setSummaryModalDismissed(true)}
        onRetry={handleRetry}
        campaignId={campaign.id}
        subject={campaign.subject}
        status={campaign.status}
        isDryRun={campaign.isDryRun}
        totalRecipients={campaign.totalRecipients}
        sentCount={campaign.sentCount}
        failedCount={campaign.failedCount}
        needsReviewCount={campaign.needsReviewCount}
      />
    </div>
  );
}
