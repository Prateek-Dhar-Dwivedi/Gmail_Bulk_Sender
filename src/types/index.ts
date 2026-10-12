export type CampaignStatus =
  | "draft"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "completed_with_errors"
  | "cancelled";

export type RecipientStatus =
  | "pending"
  | "sending"
  | "sent"
  | "failed"
  | "needs_review"
  | "cancelled";

export interface RecipientParseResult {
  valid: string[];
  duplicates: string[];
  invalid: { email: string; reason: string }[];
  counts: {
    total: number;
    valid: number;
    duplicates: number;
    invalid: number;
  };
}

export interface AttachmentItem {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface CampaignSummary {
  id: string;
  subject: string;
  status: CampaignStatus;
  isDryRun: boolean;
  delaySeconds: number;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  needsReviewCount: number;
  pendingCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientItem {
  id: string;
  campaignId: string;
  email: string;
  orderIndex: number;
  status: RecipientStatus;
  gmailMessageId: string | null;
  sentAt: string | null;
  attempts: number;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface AuthStatusResponse {
  isConnected: boolean;
  email: string | null;
  connectedAt: string | null;
}
