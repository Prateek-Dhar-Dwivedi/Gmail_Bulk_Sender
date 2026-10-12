"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { AuthStatusResponse } from "@/types";

export function ConnectionBadge() {
  const [status, setStatus] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ isConnected: false, email: null, connectedAt: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Checking Gmail...</span>
      </div>
    );
  }

  if (status?.isConnected && status.email) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="truncate max-w-[180px] sm:max-w-[240px]">{status.email}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      <span>Gmail Not Connected</span>
    </div>
  );
}
