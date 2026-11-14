import { auth } from "#server/auth";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { ID_SEPARATOR } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { createError, defineEventHandler, getRequestIP } from "nuxt/server";

// better-auth's own limiter is off (`server/auth.ts`): it keeps its counts in the memory of one isolate, which no other shares,
// so the auth endpoints are budgeted here through a binding as a procedure is. Keyed on the endpoint and the address, as an
// anonymous procedure is
export default defineEventHandler(async (event) => {
  if (IS_PRODUCTION) {
    const address = getIpAddress(event.req.headers, getRequestIP(event) ?? "");
    if (!address) console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
    else if (!(await env.RATE_LIMITER_AUTH.limit({ key: `${event.url.pathname}${ID_SEPARATOR}${address}` })).success)
      throw createError({ status: 429 });
  }

  return auth.handler(event.req);
});
