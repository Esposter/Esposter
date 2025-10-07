import type { Embed } from "@/models/message/webhook/Embed";

import { embedSchema } from "@/models/message/webhook/Embed";
import { USER_NAME_MAX_LENGTH } from "@/services/user/constants";
import { z } from "zod";

export interface WebhookPayload {
  avatarUrl?: string;
  content?: string;
  embeds?: Embed[];
  username?: string;
}

export const webhookPayloadSchema: z.ZodType<WebhookPayload> = z
  .object({
    avatarUrl: z.url().optional(),
    content: z.string().max(2000).optional(),
    embeds: embedSchema.array().max(10).optional(),
    username: z.string().max(USER_NAME_MAX_LENGTH).optional(),
  })
  // Ensure at least one of content or embeds exists
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  .refine((data) => data.content || (data.embeds && data.embeds.length > 0), {
    message: 'Webhook must have either "content" or "embeds".',
  });
