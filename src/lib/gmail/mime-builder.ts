import nodemailer from "nodemailer";

export interface MimeMessageOptions {
  from: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string | null;
  isHtml?: boolean;
  attachments?: {
    filename: string;
    filePath: string;
    mimeType: string;
  }[];
}

/**
 * Converts a Buffer into Gmail API's URL-safe base64 string format (base64url).
 */
export function bufferToBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds an RFC 2822 standards-compliant MIME message using Nodemailer.
 * Encodes Unicode subject/body and binary attachments, returning base64url formatted string
 * ready for the Gmail API users.messages.send endpoint.
 */
export async function buildRawMimeMessage(options: MimeMessageOptions): Promise<string> {
  const { from, to, subject, bodyText, bodyHtml, isHtml, attachments = [] } = options;

  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "windows",
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to,
    subject,
    text: bodyText,
    ...(isHtml && bodyHtml ? { html: bodyHtml } : {}),
    attachments: attachments.map((att) => ({
      filename: att.filename,
      path: att.filePath,
      contentType: att.mimeType,
    })),
  };

  const result = await transport.sendMail(mailOptions);
  const rawBuffer = result.message as Buffer;

  return bufferToBase64Url(rawBuffer);
}
