import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";
import { DatabaseEntityType } from "@esposter/db-schema";

// A webhook is a machine identity rather than a caller, so its budget is keyed on the webhook row's own id and
// No user or address is involved
export const webhookRateLimiter = createRateLimiter({
  blockDuration: RATE_LIMITER_DURATION_SECONDS,
  keyPrefix: DatabaseEntityType.Webhook,
  points: 30,
});
