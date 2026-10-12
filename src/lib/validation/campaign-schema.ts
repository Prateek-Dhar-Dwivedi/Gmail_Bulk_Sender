import { z } from "zod";

export const CreateCampaignSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(500, "Subject cannot exceed 500 characters"),
  bodyText: z
    .string()
    .min(1, "Email body is required")
    .max(100000, "Email body cannot exceed 100,000 characters"),
  bodyHtml: z.string().optional(),
  isHtml: z.boolean().default(false),
  isDryRun: z.boolean().default(false),
  delaySeconds: z
    .number()
    .int("Delay must be a whole number of seconds")
    .min(2, "Minimum delay between emails is 2 seconds to protect account health")
    .max(3600, "Maximum delay is 3600 seconds")
    .default(10),
  recipientInput: z
    .string()
    .min(1, "At least one recipient address is required"),
  attachmentIds: z.array(z.string()).default([]),
});

export const PreviewCampaignSchema = z.object({
  recipientInput: z.string(),
  subject: z.string().optional(),
  bodyText: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type PreviewCampaignInput = z.infer<typeof PreviewCampaignSchema>;
