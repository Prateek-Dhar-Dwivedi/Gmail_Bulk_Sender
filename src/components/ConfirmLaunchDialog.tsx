"use client";

import { AlertTriangle, Send, ShieldCheck, X } from "lucide-react";

interface ConfirmLaunchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  recipientCount: number;
  delaySeconds: number;
  senderEmail: string;
  isDryRun: boolean;
}

export function ConfirmLaunchDialog({
  isOpen,
  onClose,
  onConfirm,
  loading,
  recipientCount,
  delaySeconds,
  senderEmail,
  isDryRun,
}: ConfirmLaunchDialogProps) {
  if (!isOpen) return null;

  const totalMinutes = ((recipientCount * delaySeconds) / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                isDryRun ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {isDryRun ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isDryRun ? "Confirm Dry Run Campaign" : "Confirm Real Campaign Launch"}
              </h3>
              <p className="text-xs text-slate-500">
                {isDryRun
                  ? "Test simulation without sending real messages"
                  : "Please review campaign parameters carefully"}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Sender Account:</span>
              <span className="font-medium text-slate-900">{senderEmail}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Total Recipients:</span>
              <span className="font-semibold text-slate-900">{recipientCount} individual emails</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Delay between emails:</span>
              <span className="font-medium text-slate-900">{delaySeconds} seconds</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Est. duration:</span>
              <span className="font-medium text-slate-900">~{totalMinutes} minutes</span>
            </div>
          </div>

          {!isDryRun ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Irreversible Action Notice:</p>
              <p>
                Once sent, emails cannot be recalled. The background queue worker will dispatch
                emails sequentially one by one from your personal Gmail account.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Dry run will simulate each step with database tracking, but <strong>no real emails</strong> will be sent through Gmail.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors ${
                isDryRun
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Starting..." : isDryRun ? "Start Dry Run" : "Start Sending Campaign"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
