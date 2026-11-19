import type { UndefinedOnPartial } from "type-fest";
import type { PushSubscription } from "web-push";

import {
  PUSH_SUBSCRIPTION_AUTH_MAX_LENGTH,
  PUSH_SUBSCRIPTION_P256DH_MAX_LENGTH,
} from "#shared/services/notification/constants";
import { isPushServiceEndpoint, URL_MAX_LENGTH } from "@esposter/db-schema";
import { z } from "zod";

// Zod's optional output admits `undefined`, and web-push's optional `expirationTime` does not, under
// Exactly-optional types, so the constraint admits `undefined` for that one field
export const pushSubscriptionInputSchema = z.object({
  // The jobs worker POSTs to this url, so only a browser's push service may be named (PUSH_SERVICE_HOSTS)
  endpoint: z
    .url()
    .max(URL_MAX_LENGTH)
    .refine(isPushServiceEndpoint, { error: "Invalid input: expected the endpoint of a browser's push service" }),
  expirationTime: z.number().nonnegative().nullish(),
  keys: z.object({
    auth: z.string().max(PUSH_SUBSCRIPTION_AUTH_MAX_LENGTH),
    p256dh: z.string().max(PUSH_SUBSCRIPTION_P256DH_MAX_LENGTH),
  }),
}) satisfies z.ZodType<UndefinedOnPartial<PushSubscription>>;
