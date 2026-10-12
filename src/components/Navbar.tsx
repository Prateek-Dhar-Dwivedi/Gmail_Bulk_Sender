"use client";

import Link from "next/link";
import { Mail, Menu, X, LayoutDashboard, PlusCircle, History, Settings } from "lucide-react";
import { useState } from "react";
import { ConnectionBadge } from "./ConnectionBadge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/icon.svg"
              alt="MailSprint Logo"
              className="w-7 h-7 rounded-lg shadow-sm flex-shrink-0"
            />
            <span className="font-semibold text-slate-900 text-sm">MailSprint Dispatcher</span>
          </div>
        </div>

        <div className="hidden md:block">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Sequential Email Automation
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionBadge />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Dashboard
          </Link>
          <Link
            href="/campaigns/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            New Campaign
          </Link>
          <Link
            href="/campaigns/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <History className="w-4 h-4 text-slate-500" />
            Campaign History
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Settings
          </Link>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3 px-3 text-xs text-slate-400">
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:underline hover:text-blue-600"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:underline hover:text-blue-600"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
