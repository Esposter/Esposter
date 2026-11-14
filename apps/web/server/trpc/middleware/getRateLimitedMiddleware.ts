import type { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";

import { readSession } from "#server/services/auth/readSession";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { RateLimiterMap } from "#server/services/rateLimiter/RateLimiterMap";
import { middleware } from "#server/trpc";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { env } from "cloudflare:workers";

// A rate limit binding answers only whether a key is within its budget, so a refusal is the whole answer: the points left and
// the time to the reset are not known to the Worker, and no rate limit header is written
export const getRateLimitedMiddleware = (type: RateLimiterType) =>
  middleware(async ({ ctx, next, path }) => {
    const getSessionPayload = ctx.getSessionPayload ?? (await readSession(ctx.headers, ctx.responseHeaders));
    if (!IS_PRODUCTION) return next({ ctx: { getSessionPayload } });

    const { ipAddress } = ctx;
    if (!getSessionPayload && !ipAddress) {
      console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
      return next({ ctx: { getSessionPayload } });
    }

    const { success } = await env[RateLimiterMap[type]].limit({
      key: getSessionPayload ? getSessionPayload.user.id : `${path}${ID_SEPARATOR}${ipAddress}`,
    });
    if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    return next({ ctx: { getSessionPayload } });
  });
