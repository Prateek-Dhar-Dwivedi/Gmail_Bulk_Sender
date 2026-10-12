# MailSprint Dispatcher

A production-conscious, full-stack web application built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **SQLite / PostgreSQL (Prisma ORM)** that automates sending emails through your personal Gmail account, **one recipient at a time**, via the official Google Gmail API.

---

## 1. Project Objective & Core Architecture

The purpose of **MailSprint Dispatcher** is to eliminate repetitive manual work:
1. Pasting addresses one by one.
2. Opening compose windows.
3. Attaching files repeatedly.
4. Pressing send and waiting.

### Architecture Highlights
- **Individual 1-to-1 Dispatch**: For $N$ valid recipients, $N$ distinct messages are delivered via the official Gmail API (`users.messages.send`). No recipient sees another recipient. **No CC or BCC shortcuts are ever used.**
- **Dual-Process Architecture**:
  - **Next.js Web App (`npm run dev`)**: Manages the UI, Google OAuth 2.0 flow, campaign configuration, file uploads, and queue control endpoints.
  - **Persistent Node.js Worker (`npm run worker`)**: A standalone background worker process that acquires atomic database leases, enforces sequential message delivery with configurable delays (default 10s), handles bounded exponential backoff with jitter on transient failures, and recovers in-flight work safely.
- **Dry-Run Mode**: Test campaigns, recipient parsing, database tracking, and UI progress without sending real emails or consuming Google API quotas.
- **Security at Rest**: Google OAuth refresh tokens are encrypted at rest using **AES-256-GCM** with a 256-bit server-side key (`TOKEN_ENCRYPTION_KEY`). Tokens and client secrets are never exposed to the client.
- **Private Attachment Isolation**: Uploads are stored in a private directory outside the web root (`./private-uploads`) with path-traversal protection and size limits.
- **Spreadsheet Formula Injection Protection**: All exported CSV reports sanitize leading formula characters (`=`, `+`, `-`, `@`) with prepended single quotes.

---

## 2. Prerequisites

- **Operating System**: Windows 10/11 (PowerShell), macOS, or Linux.
- **Node.js**: Node.js LTS (v20+ or v22+).
- **Google Cloud Account**: A Google account to configure OAuth 2.0 credentials and enable the Gmail API.

---

## 3. Google Cloud Console Setup Guide

To send real emails through your own Gmail account, follow these steps to obtain OAuth 2.0 credentials:

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name your project (e.g., `Gmail-Bulk-Sender-Local`) and click **Create**.

### Step 2: Enable the Gmail API
1. In the sidebar, go to **APIs & Services** > **Library**.
2. Search for `Gmail API`.
3. Click **Gmail API** and click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you are using Google Workspace internal users), and click **Create**.
3. Fill in the required fields:
   - **App name**: `Gmail Bulk Sender`
   - **User support email**: Your Gmail address
   - **Developer contact information**: Your Gmail address
4. Click **Save and Continue**.
5. In **Scopes**, click **Add or Remove Scopes**, filter for `Gmail API`, and select:
   - `https://www.googleapis.com/auth/gmail.send` (Send emails on your behalf)
   - `https://www.googleapis.com/auth/userinfo.email` (Identify connected account)
6. Click **Save and Continue**.
7. In **Test users**, click **+ Add Users** and add your Gmail address. *(Important: Unverified external apps in test mode can only authenticate added test users).*
8. Click **Save and Continue**.

### Step 4: Create OAuth 2.0 Web Client Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `Gmail Bulk Sender Web Client`.
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Click **Create**.
7. Copy your **Client ID** and **Client Secret**.

---

## 4. Environment Variables Configuration

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in the values:

```env
# Google Cloud OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Application URL
APP_URL="http://localhost:3000"

# Session Secret (random 32+ char string)
SESSION_SECRET="dev-session-at-least-32-chars-long-you-should-make-it-a-unique-one"

# Token Encryption Key: 32-byte hex string (64 characters) for AES-256-GCM
TOKEN_ENCRYPTION_KEY="b4c59d1a8e874f26b5d901428c04e287fa3198cd6819eb7b3401569a714e82d1"

# SQLite Database
DATABASE_URL="file:./dev.db"

# Private Upload Storage
UPLOAD_DIR="./private-uploads"
```

> **Tip (Generating a random 64-hex encryption key in PowerShell):**
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 5. Local Setup & Windows PowerShell Run Commands

### 1. Install Dependencies
```powershell
npm install
```

### 2. Initialize Database & Generate Prisma Client
```powershell
npx prisma generate
npx prisma db push
```

### 3. Run Web App and Background Worker

#### Option A: Single Command (Concurrently)
You can run both the Next.js web application and the persistent background worker together in a single PowerShell window:
```powershell
npm run dev:all
```

#### Option B: Two Separate PowerShell Windows (Recommended for Clear Logging)
- **Terminal 1 (Web Interface & API Handlers):**
  ```powershell
  npm run dev
  ```
- **Terminal 2 (Persistent Queue Worker):**
  ```powershell
  npm run worker
  ```

Open your browser at `http://localhost:3000`.

---

## 6. Running Tests & Production Build

### Run Automated Unit and Integration Tests (Vitest)
```powershell
npm test
```

### Build for Production
```powershell
npm run build
```

---

## 7. Sending Limits & Gmail Policies

- **Free Personal Gmail (`@gmail.com`)**: Google enforces a limit of **500 recipients per rolling 24-hour period**.
- **Google Workspace (`@yourdomain.com`)**: Up to **2,000 recipients per rolling 24-hour period**.
- **Recommended Delay**: Keep the delay set to at least **10 seconds** between messages to maintain high deliverability and avoid transient rate-limiting spikes.
- **Accepted vs. Delivered**: A successful Gmail API call confirms that Google accepted the message for delivery; inbox placement and spam filtering depend on standard email reputation factors.

---

## 8. Manual Testing Checklist

1. **OAuth Connection**:
   - Navigate to `/settings` or click **Connect Gmail** on the dashboard.
   - Complete Google's authorization screen.
   - Verify that your Gmail address is shown in the green status badge.
2. **Recipient Parser**:
   - Paste a mixed list with commas, semicolons, duplicate addresses, and an invalid address.
   - Verify that the live counter displays correct valid, duplicate, and invalid counts.
3. **Dry-Run Campaign**:
   - Toggle **Dry Run Mode** on the new campaign page.
   - Click **Preview Email** to inspect the 1-to-1 rendered preview.
   - Click **Start Campaign** and confirm in the dialog.
   - Watch the background worker process each recipient sequentially in Terminal 2.
   - Observe live counter updates (Total, Sent, Pending) on the active campaign page.
4. **Pause, Resume, and Cancel**:
   - Create a campaign with 5 recipients.
   - Click **Pause**: verify that the current message finishes and no further messages are sent.
   - Click **Resume**: verify that remaining pending recipients continue.
   - Click **Cancel**: verify that remaining messages are marked cancelled.
5. **CSV Export**:
   - Go to `/campaigns/history` or any campaign page.
   - Click **Export CSV** and open in Excel / Sheets. Verify headers, statuses, and message IDs.
