"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the master passcode");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Successfully authenticated -> redirect to requested destination
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-slate-300 mb-1.5"
        >
          Master Passcode
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter passcode..."
            className="block w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 shadow-lg shadow-blue-600/30 disabled:opacity-60 transition-all cursor-pointer"
      >
        {loading ? (
          <span>Unlocking Dashboard...</span>
        ) : (
          <>
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl shadow-black/40">
            <img
              src="/icon.svg"
              alt="MailSprint Logo"
              className="w-12 h-12 rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            MailSprint Dispatcher
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            This dashboard is access-protected. Enter your Master Passcode to unlock campaign controls.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <Suspense fallback={<div className="text-xs text-slate-400 text-center py-4">Loading authorization...</div>}>
            <LoginForm />
          </Suspense>

          {/* Security note */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected by AES-256-GCM & Session Encryption</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-slate-500 flex justify-center items-center gap-3">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
