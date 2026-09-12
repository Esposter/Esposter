import type { Embed } from "#src/models/message/webhook/Embed";

import { embedSchema } from "#src/models/message/webhook/Embed";
import { EMBED_MAX_LENGTH, WEBHOOK_CONTENT_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { USER_NAME_MAX_LENGTH } from "#src/services/user/constants";
import { z } from "zod";

export interface WebhookPayload {
  avatar_url?: string;
  content?: string;
  embeds?: Embed[];
  username?: string;
}

export const webhookPayloadSchema = z
  .object({
    avatar_url: z.url().optional(),
    content: z.string().max(WEBHOOK_CONTENT_MAX_LENGTH).optional(),
    embeds: embedSchema.array().max(EMBED_MAX_LENGTH).optional(),
    username: z.string().max(USER_NAME_MAX_LENGTH).optional(),
  })
  // Ensure at least one of content or embeds exists
  .refine((data) => data.content || (data.embeds && data.embeds.length > 0), {
    message: 'Webhook must have either "content" or "embeds".',
  }) satisfies z.ZodType<WebhookPayload>;
