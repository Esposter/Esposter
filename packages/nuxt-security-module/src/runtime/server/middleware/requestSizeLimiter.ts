import type { Middleware } from "nitro/h3";

import { checkIsRequestTooLarge } from "#src/runtime/services/checkIsRequestTooLarge";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { defineMiddleware } from "nitro";
import { HTTPError } from "nitro/h3";

// A request whose declared body is over its limit is refused with `413` before any handler reads it
const requestSizeLimiter: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.requestSizeLimiter) return;

  const contentLength = event.req.headers.get("content-length");
  const contentType = event.req.headers.get("content-type");
  if (checkIsRequestTooLarge(event.req.method, contentLength, contentType, rules.requestSizeLimiter))
    throw new HTTPError({ status: 413, statusText: "Payload Too Large" });
});

export default requestSizeLimiter;
