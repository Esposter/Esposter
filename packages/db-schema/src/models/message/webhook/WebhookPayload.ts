import { WEBHOOK_CONTENT_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { USER_NAME_MAX_LENGTH } from "#src/services/user/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

export interface WebhookPayload {
  avatar_url?: string;
  content: string;
  username?: string;
}

// Discord's payload also takes `embeds`, but a message has nowhere to store one, so the schema refuses every key it
// Does not declare rather than accepting a payload and silently dropping part of it
export const webhookPayloadSchema = z.strictObject({
  avatar_url: z.url().optional(),
  // Rendered as message markup like every other message body, so it is sanitized the same way before it is
  // Stored — the one message a caller outside the app writes cannot be the one that skips it
  content: z.string().transform(sanitizeTextHtml).pipe(z.string().min(1).max(WEBHOOK_CONTENT_MAX_LENGTH)),
  username: z.string().max(USER_NAME_MAX_LENGTH).optional(),
}) satisfies z.ZodType<WebhookPayload>;
