"use client";

import { X, Mail, Paperclip, Eye } from "lucide-react";
import type { AttachmentItem } from "@/types";

interface CampaignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderEmail: string;
  sampleRecipient: string;
  subject: string;
  bodyText: string;
  attachments: AttachmentItem[];
  delaySeconds: number;
  isDryRun: boolean;
}

export function CampaignPreviewModal({
  isOpen,
  onClose,
  senderEmail,
  sampleRecipient,
  subject,
  bodyText,
  attachments,
  delaySeconds,
  isDryRun,
}: CampaignPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Campaign Preview</h2>
            {isDryRun && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                DRY RUN
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Mock Email Viewer */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium w-16">From:</span>
              <span className="text-slate-900 font-medium flex-1">{senderEmail}</span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium w-16">To:</span>
              <div className="flex-1">
                <span className="text-slate-900 font-medium font-mono">{sampleRecipient}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  (Each recipient receives a private 1-to-1 email with only their address in the To field)
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium w-16">Subject:</span>
              <span className="text-slate-900 font-semibold flex-1 text-sm">{subject || "(No subject)"}</span>
            </div>

            {attachments.length > 0 && (
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium w-16">Files ({attachments.length}):</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <span
                      key={file.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-700 text-[11px]"
                    >
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Email Body Preview preserving line breaks and whitespace */}
            <div className="pt-2">
              <p className="text-slate-500 font-medium mb-1">Message Content:</p>
              <div className="p-4 rounded-md bg-slate-50 border border-slate-100 whitespace-pre-wrap font-sans text-slate-800 text-xs leading-relaxed min-h-[140px]">
                {bodyText || "(Empty body)"}
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
            <span>Interval between messages: <strong>{delaySeconds} seconds</strong></span>
            <span>Delivery: <strong>Sequential via Gmail API</strong></span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
