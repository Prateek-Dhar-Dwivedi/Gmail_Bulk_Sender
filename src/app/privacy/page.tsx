import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Shield, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MailSprint Dispatcher",
  description:
    "Privacy Policy and Google API User Data Policy disclosure for MailSprint Dispatcher.",
};

export default function PrivacyPolicyPage() {
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
              <p className="text-[11px] text-slate-500">Privacy Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              Terms of Service
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
            <Shield className="w-3.5 h-3.5" />
            <span>Google API Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Effective Date: October 12, 2026 • Last Updated: October 12, 2026
          </p>
        </div>

        {/* Google API User Data Policy Disclosure Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Google API Services User Data Policy Compliance</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
            <strong>MailSprint Dispatcher</strong>&apos;s use and transfer to any other app of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-emerald-900 hover:text-emerald-700"
            >
              Google API Services User Data Policy
            </a>
            , including the <strong>Limited Use</strong> requirements.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              1. Introduction & Purpose
            </h2>
            <p>
              MailSprint Dispatcher (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) provides a sequential, 1-by-1 email dispatch tool enabling authorized users to send personalized communications through their personal or Google Workspace Gmail account using the official Google Gmail API.
            </p>
            <p>
              We are committed to protecting your privacy and ensuring complete transparency regarding how your data is handled. We never sell, rent, monetize, or use your data for advertising.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 2. Google OAuth Scopes and Data Collected */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              2. Information We Collect and Access via Google APIs
            </h2>
            <p>
              When you connect your Google account via OAuth 2.0, our application requests access strictly to the following Google OAuth scopes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>https://www.googleapis.com/auth/userinfo.email</strong>: Used strictly to verify your authorized email address and display it in your account settings.
              </li>
              <li>
                <strong>https://www.googleapis.com/auth/gmail.send</strong>: Used solely to draft and transmit individual emails initiated and customized directly by you.
              </li>
            </ul>
            <p className="mt-2">
              <strong>What We DO NOT Access:</strong> We do NOT read your inbox, we do NOT request access to view or download received emails (no <code>gmail.readonly</code> scope), and we do NOT access your Google Contacts or Drive files.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 3. How We Use Your Data */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              3. How We Use Collected Information
            </h2>
            <p>Your information is used strictly to provide the core functionality of the application:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Authenticating your session and confirming ownership of your connected Gmail address.</li>
              <li>Composing and sending personalized emails sequentially to your uploaded list of recipients at your configured delay intervals.</li>
              <li>Recording Google Message IDs and dispatch timestamps so you can review audit logs and download delivery CSV reports.</li>
            </ul>
            <p className="mt-2">
              We never use Google user data to serve advertisements, train artificial intelligence or machine learning models, or build behavioral profiles.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 4. Data Storage and Security */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>4. Data Storage & Security Standards</span>
            </h2>
            <p>We implement enterprise-grade security controls to protect your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Token Encryption at Rest:</strong> All Google OAuth tokens and refresh tokens are encrypted using military-grade <strong>AES-256-GCM</strong> encryption before being stored in the database.
              </li>
              <li>
                <strong>Isolated Key Management:</strong> Cryptographic encryption keys are stored exclusively as server-side environment variables and are never accessible to client browsers.
              </li>
              <li>
                <strong>HTTPS / TLS Transmission:</strong> All communications between your browser, our servers, and Google APIs take place over encrypted TLS/HTTPS connections.
              </li>
              <li>
                <strong>Private File Storage:</strong> Email attachments uploaded for campaigns are held in private, isolated directories and protected from directory traversal attacks.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 5. Data Sharing and Third Parties */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              5. Third-Party Sharing & Data Transfers
            </h2>
            <p>
              We do not transfer or disclose your Google user data to any third party, except:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Directly to Google servers via the official Gmail API to fulfill your request to send emails.</li>
              <li>To our secure cloud infrastructure providers (e.g., Render, Neon PostgreSQL) strictly for hosting and operating the service under confidentiality terms.</li>
              <li>As required by applicable law, regulation, or legal process.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 6. User Control & Data Deletion */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              6. Your Rights & Account Disconnection
            </h2>
            <p>You have full control over your Google authorization and data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Disconnect Account:</strong> You can disconnect your Gmail account at any time by navigating to <strong>Settings</strong> and clicking <em>Disconnect Account</em>.
              </li>
              <li>
                <strong>Automatic Revocation:</strong> Disconnecting immediately deletes your encrypted OAuth tokens from our database and sends a revocation request to Google&apos;s OAuth authorization server.
              </li>
              <li>
                <strong>Google Account Permissions:</strong> You can also revoke access directly through your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Google Security Permissions Dashboard
                </a>
                .
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* 7. Contact Information */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              7. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact the developer:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-slate-900">MailSprint Dispatcher Support</p>
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
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline text-slate-600 font-medium">Privacy Policy</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
