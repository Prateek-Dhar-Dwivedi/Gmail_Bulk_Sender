import type { Metadata } from "next";
import Link from "next/link";
import { Mail, FileText, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MailSprint Dispatcher",
  description:
    "Terms of Service and Acceptable Use Policy for MailSprint Dispatcher.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                MailSprint Dispatcher
              </span>
              <p className="text-[11px] text-slate-500">Terms of Service</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Effective Date: October 12, 2026 • Last Updated: October 12, 2026
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* 1. Acceptance of Terms */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, connecting your Google account to, or using <strong>MailSprint Dispatcher</strong> (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you may not access or use the Service.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 2. Description of Service */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              2. Description of the Service
            </h2>
            <p>
              MailSprint Dispatcher is an email dispatch automation platform designed to send 1-to-1 sequential messages through your personal or Google Workspace Gmail account using the official Google Gmail API (<code>users.messages.send</code>).
            </p>
            <p>
              The Service enforces individual recipient routing (never CC/BCC bundling), sequential pacing with configurable delays, and delivery tracking.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 3. Acceptable Use & Anti-Spam Policy */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>3. Acceptable Use & Anti-Spam Policy</span>
            </h2>
            <p>
              You agree to use MailSprint Dispatcher responsibly and strictly in accordance with all applicable laws and regulations. You specifically agree that you will NOT:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Send unsolicited marketing emails, mass spam, fraudulent promotions, or communications in violation of the <strong>CAN-SPAM Act</strong>, <strong>GDPR</strong>, or local anti-spam regulations.
              </li>
              <li>
                Send phishing attempts, malware, spyware, malicious links, or harmful code.
              </li>
              <li>
                Forge email headers, impersonate another individual or organization without authorization, or misrepresent the sender identity.
              </li>
              <li>
                Attempt to bypass Google&apos;s daily sending limits (500 recipients/day for personal Gmail accounts, 2,000 recipients/day for Google Workspace accounts).
              </li>
              <li>
                Use the Service in violation of the{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Google Terms of Service
                </a>{" "}
                or the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Google API Services User Data Policy
                </a>.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 4. Google Account & API Quotas */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              4. Google Account Authorization & Quotas
            </h2>
            <p>
              You are solely responsible for all emails sent through your authorized Gmail account. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Email deliverability depends on your sender reputation, domain authentication, content hygiene, and recipient server filters.
              </li>
              <li>
                Google enforces strict daily recipient limits. The Service provides pacing and delay controls to help protect your sending quota, but you remain responsible for monitoring your account usage.
              </li>
              <li>
                You can disconnect your account at any time, which immediately deletes stored credentials and revokes the OAuth token.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 5. Disclaimer of Warranties */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              5. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT EMAILS WILL BE ACCEPTED BY RECIPIENT MAIL SERVERS, REACH RECIPIENT INBOXES, OR BE DELIVERED WITHOUT UNINTENDED DELAYS CAUSED BY THIRD-PARTY NETWORKS OR GOOGLE API SERVICE OUTAGES.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 6. Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              6. Limitation of Liability
            </h2>
            <p>
              IN NO EVENT SHALL THE DEVELOPERS OR HOSTING PROVIDERS OF MAILSPRINT DISPATCHER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 7. Changes to Terms */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. When modifications occur, the &quot;Last Updated&quot; date at the top of this document will be updated. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 8. Contact Information */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              8. Contact
            </h2>
            <p>
              For legal questions or notices regarding these Terms of Service, please reach out:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-slate-900">MailSprint Dispatcher Legal Support</p>
              <p className="text-slate-600 mt-1">
                Developer: Prateek Dhar Dwivedi
              </p>
              <p className="text-slate-600">
                Email:{" "}
                <a
                  href="mailto:prateekdhardwivedi10@gmail.com"
                  className="text-blue-600 font-medium hover:underline"
                >
                  prateekdhardwivedi10@gmail.com
                </a>
              </p>
              <p className="text-slate-600">
                Application URL:{" "}
                <a
                  href="https://gmail-bulk-sender-x6fv.onrender.com"
                  className="text-blue-600 font-medium hover:underline"
                >
                  https://gmail-bulk-sender-x6fv.onrender.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4">
          <p>© {new Date().getFullYear()} MailSprint Dispatcher. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/terms" className="hover:underline text-slate-600 font-medium">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
