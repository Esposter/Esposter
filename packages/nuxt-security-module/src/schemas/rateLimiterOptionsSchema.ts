import type { RateLimiterOptions } from "#src/models/RateLimiterOptions";

import { z } from "zod";

export const rateLimiterOptionsSchema: z.ZodType<RateLimiterOptions> = z.strictObject({
  intervalInMilliseconds: z
    .int("must be a whole number of milliseconds")
    .positive("must be more than zero milliseconds"),
  tokensPerInterval: z.int("must be a whole number of requests").positive("must allow at least one request"),
});
