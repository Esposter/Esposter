import type { PushSubscription } from "web-push";

import { z } from "zod/v4";

export const pushSubscriptionSchema = z.object({
  endpoint: z.url(),
  expirationTime: z.number().nullish(),
  keys: z.object({
    auth: z.string(),
    p256dh: z.string(),
  }),
}) satisfies z.ZodType<PushSubscription>;
