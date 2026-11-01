import type { Middleware } from "nitro/h3";

import { checkIsBodyCounted } from "#src/runtime/services/checkIsBodyCounted";
import { checkIsRequestTooLarge } from "#src/runtime/services/checkIsRequestTooLarge";
import { getRequestSizeLimit } from "#src/runtime/services/getRequestSizeLimit";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { defineMiddleware } from "nitro";
import { assertBodySize, HTTPError } from "nitro/h3";

// A request whose declared body is over its limit is refused with `413` before any handler reads it.
// A body with no declared length is counted as a handler reads it, and a read past its limit fails with `413`
const requestSizeLimiter: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.requestSizeLimiter) return;

  const { method } = event.req;
  const contentLength = event.req.headers.get("content-length");
  const contentType = event.req.headers.get("content-type");
  if (checkIsRequestTooLarge(method, contentLength, contentType, rules.requestSizeLimiter))
    throw new HTTPError({ status: 413, statusText: "Payload Too Large" });

  if (checkIsBodyCounted(method, contentLength))
    assertBodySize(event, getRequestSizeLimit(contentType, rules.requestSizeLimiter));
});

export default requestSizeLimiter;
