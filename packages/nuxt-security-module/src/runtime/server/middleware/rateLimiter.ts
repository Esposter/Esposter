import type { Middleware } from "nitro/h3";

import { defineMiddleware } from "nitro";
import { getRequestIP, HTTPError } from "nitro/h3";

import { MAX_RATE_LIMIT_ENTRIES, UNKNOWN_CLIENT_KEY } from "#src/runtime/constants";
import { createInMemoryRateLimiterStore } from "#src/runtime/services/createInMemoryRateLimiterStore";
import { getRetryAfterSeconds } from "#src/runtime/services/getRetryAfterSeconds";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

const rateLimiterStore = createInMemoryRateLimiterStore(MAX_RATE_LIMIT_ENTRIES);

// The client is the connection's address. A forwarded address is a header the client writes itself,
// so it is read only when a trusted proxy is set up to say so, and never by default
const rateLimiter: Middleware = defineMiddleware(async (event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.rateLimiter) return;

  const key = getRequestIP(event, { xForwardedFor: false }) ?? UNKNOWN_CLIENT_KEY;
  const retryAfterSeconds = await getRetryAfterSeconds(rateLimiterStore, key, rules.rateLimiter);
  if (retryAfterSeconds === undefined) return;

  event.res.headers.set("Retry-After", String(retryAfterSeconds));
  throw new HTTPError({ status: 429, statusText: "Too Many Requests" });
});

export default rateLimiter;
