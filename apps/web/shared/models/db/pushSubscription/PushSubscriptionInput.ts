import type { PushSubscription } from "web-push";

import {
  PUSH_SUBSCRIPTION_AUTH_MAX_LENGTH,
  PUSH_SUBSCRIPTION_P256DH_MAX_LENGTH,
} from "#shared/services/notification/constants";
import { z } from "zod";

export const pushSubscriptionInputSchema = z.object({
  endpoint: z.url(),
  expirationTime: z.number().nonnegative().nullish(),
  keys: z.object({
    auth: z.string().max(PUSH_SUBSCRIPTION_AUTH_MAX_LENGTH),
    p256dh: z.string().max(PUSH_SUBSCRIPTION_P256DH_MAX_LENGTH),
  }),
}) satisfies z.ZodType<PushSubscription>;
