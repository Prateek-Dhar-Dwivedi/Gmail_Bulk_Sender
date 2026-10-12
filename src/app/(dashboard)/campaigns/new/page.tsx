"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RecipientInput } from "../../../../components/RecipientInput";
import { AttachmentPicker } from "../../../../components/AttachmentPicker";
import { CampaignPreviewModal } from "../../../../components/CampaignPreviewModal";
import { ConfirmLaunchDialog } from "../../../../components/ConfirmLaunchDialog";
import { parseRecipients } from "@/lib/validation/email-parser";
import type { AttachmentItem, AuthStatusResponse } from "@/types";
import { Send, Eye, ShieldCheck, AlertCircle, Clock } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();

  // Form State
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [delaySeconds, setDelaySeconds] = useState(10);
  const [isDryRun, setIsDryRun] = useState(false);

  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Status
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setAuthStatus(data))
      .catch(() => {});
  }, []);

  const analysis = useMemo(() => {
    return parseRecipients(recipientInput);
  }, [recipientInput]);

  const canLaunch = useMemo(() => {
    return (
      analysis.valid.length > 0 &&
      subject.trim().length > 0 &&
      bodyText.trim().length > 0 &&
      (isDryRun || authStatus?.isConnected)
    );
  }, [analysis.valid.length, subject, bodyText, isDryRun, authStatus?.isConnected]);

  const handleLaunchCampaign = async () => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      // 1. Create the campaign and recipients
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientInput,
          subject,
          bodyText,
          isDryRun,
          delaySeconds: Number(delaySeconds),
          attachmentIds: attachments.map((a) => a.id),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      const campaignId = data.campaignId;

      // 2. Start the campaign (transition to queued)
      const startRes = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: "POST",
      });

      const startData = await startRes.json();
      if (!startRes.ok) {
        throw new Error(startData.error || "Failed to queue campaign for sending");
      }

      setConfirmOpen(false);
      // Navigate to tracking page
      router.push(`/campaigns/${campaignId}`);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while launching campaign.");
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          New Email Campaign
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure recipients, content, attachments, and sending interval.
        </p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Gmail Disconnected Warning */}
      {!authStatus?.isConnected && !isDryRun && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Your Gmail account is not connected. Connect your account in Settings, or enable <strong>Dry Run</strong> mode to test without sending.
            </span>
          </div>
          <a
            href="/api/auth/google"
            className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors ml-4 whitespace-nowrap"
          >
            Connect Gmail
          </a>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
        {/* Recipient Textarea with Delimiters */}
        <RecipientInput
          value={recipientInput}
          onChange={setRecipientInput}
          disabled={isSubmitting}
        />

        {/* Subject Input */}
        <div className="space-y-1.5">
          <label htmlFor="subject-input" className="block text-sm font-medium text-slate-700">
            Subject
          </label>
          <input
            id="subject-input"
            type="text"
            disabled={isSubmitting}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Important update regarding your project"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Body Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="body-textarea" className="block text-sm font-medium text-slate-700">
              Message Body (Plain Text)
            </label>
            <span className="text-xs text-slate-400">
              Exact formatting and line breaks will be preserved
            </span>
          </div>
          <textarea
            id="body-textarea"
            rows={8}
            disabled={isSubmitting}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Hi there,&#10;&#10;Here is the exact information you requested..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans whitespace-pre-wrap"
          />
        </div>

        {/* Attachments */}
        <AttachmentPicker
          attachments={attachments}
          onChange={setAttachments}
          disabled={isSubmitting}
        />

        {/* Configuration Row: Delay & Dry Run */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="delay-input" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Delay Between Emails (Seconds)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="delay-input"
                type="number"
                min={2}
                max={3600}
                disabled={isSubmitting}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Math.max(2, Number(e.target.value)))}
                className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500">
                Recommended: 10 seconds (enforced min: 2s)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Dry Run Mode</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDryRun}
                disabled={isSubmitting}
                onChange={(e) => setIsDryRun(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-600">
                Simulate sending and log state without calling Gmail API
              </span>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Email</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canLaunch || isSubmitting}
              onClick={() => setConfirmOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                canLaunch
                  ? isDryRun
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isDryRun ? "Launch Dry Run" : "Start Campaign"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <CampaignPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        senderEmail={authStatus?.email || "your-email@gmail.com"}
        sampleRecipient={analysis.valid[0] || "recipient@example.com"}
        subject={subject}
        bodyText={bodyText}
        attachments={attachments}
        delaySeconds={delaySeconds}
        isDryRun={isDryRun}
      />

      {/* Explicit Confirmation Dialog */}
      <ConfirmLaunchDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLaunchCampaign}
        loading={isSubmitting}
        recipientCount={analysis.valid.length}
        delaySeconds={delaySeconds}
        senderEmail={authStatus?.email || (isDryRun ? "dryrun-simulator@example.com" : "Not connected")}
        isDryRun={isDryRun}
      />
    </div>
  );
}
