"use client";

import { useState } from "react";
import { Paperclip, X, UploadCloud, AlertCircle } from "lucide-react";
import type { AttachmentItem } from "@/types";

interface AttachmentPickerProps {
  attachments: AttachmentItem[];
  onChange: (attachments: AttachmentItem[]) => void;
  disabled?: boolean;
}

export function AttachmentPicker({ attachments, onChange, disabled }: AttachmentPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBytes = attachments.reduce((acc, curr) => acc + curr.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const newAttachments: AttachmentItem[] = [...attachments];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 15 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 15MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || `Failed to upload "${file.name}"`);
          continue;
        }

        newAttachments.push({
          id: data.id,
          filename: data.filename,
          size: data.size,
          mimeType: data.mimeType,
        });
      }

      onChange(newAttachments);
    } catch (err: any) {
      setError(err.message || "Failed to upload attachments.");
    } finally {
      setUploading(false);
      // Reset input value so same file can be re-selected if removed
      e.target.value = "";
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    } catch {
      // Ignore background delete errors
    }
    onChange(attachments.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Attachments (Optional)
        </label>
        <span className="text-xs text-slate-500">
          Max 15MB per file • Total: {totalMb} MB
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload button area */}
      <div className="flex items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors ${
            disabled || uploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <UploadCloud className="w-4 h-4 animate-bounce text-blue-600" />
          ) : (
            <Paperclip className="w-4 h-4 text-slate-500" />
          )}
          <span>{uploading ? "Uploading file..." : "Add Attachments"}</span>
          <input
            type="file"
            multiple
            disabled={disabled || uploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <span className="text-xs text-slate-500">
          Attached files will be dispatched individually with each message.
        </span>
      </div>

      {/* Attached files list */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[200px] truncate" title={file.filename}>
                {file.filename}
              </span>
              <span className="text-slate-400 font-normal">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                disabled={disabled}
                className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
