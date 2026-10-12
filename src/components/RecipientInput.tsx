"use client";

import { useMemo, useState } from "react";
import { parseRecipients } from "@/lib/validation/email-parser";
import { CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react";

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RecipientInput({ value, onChange, disabled }: RecipientInputProps) {
  const [showDetails, setShowDetails] = useState(false);

  const analysis = useMemo(() => {
    return parseRecipients(value);
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="recipients-textarea" className="block text-sm font-medium text-slate-700">
          Recipient Addresses
        </label>
        <span className="text-xs text-slate-500">
          Separate with newlines, commas, or semicolons
        </span>
      </div>

      <textarea
        id="recipients-textarea"
        rows={6}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`user1@example.com\nuser2@domain.com, user3@company.org; user4@test.com`}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono disabled:bg-slate-50 disabled:text-slate-500"
      />

      {/* Live Breakdown Stats Bar */}
      {value.trim().length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-slate-700">
                Total parsed: <strong className="font-semibold text-slate-900">{analysis.counts.total}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {analysis.counts.valid} valid
              </span>

              {analysis.counts.duplicates > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {analysis.counts.duplicates} duplicate (auto-deduplicated)
                </span>
              )}

              {analysis.counts.invalid > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  {analysis.counts.invalid} invalid
                </span>
              )}
            </div>

            {(analysis.counts.invalid > 0 || analysis.counts.duplicates > 0) && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                {showDetails ? "Hide details" : "Review details"}
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
              {analysis.invalid.length > 0 && (
                <div>
                  <p className="font-medium text-rose-700 mb-1">Invalid addresses (will be excluded):</p>
                  <ul className="space-y-1 pl-2">
                    {analysis.invalid.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                        <span className="font-mono text-rose-600 bg-rose-50 px-1 rounded">{item.email}</span>
                        <span className="text-slate-500">— {item.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.duplicates.length > 0 && (
                <div>
                  <p className="font-medium text-amber-700 mb-1">
                    Duplicate entries (first occurrence preserved):
                  </p>
                  <p className="text-slate-600 font-mono text-[11px] break-all">
                    {analysis.duplicates.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
