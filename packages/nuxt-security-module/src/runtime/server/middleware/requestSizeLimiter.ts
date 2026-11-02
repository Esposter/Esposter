import type { Middleware } from "nitro/h3";

import { checkIsBodyCounted } from "#src/runtime/services/checkIsBodyCounted";
import { checkIsRequestTooLarge } from "#src/runtime/services/checkIsRequestTooLarge";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { defineMiddleware } from "nitro";
import { assertBodySize, HTTPError } from "nitro/h3";

// The limit is the one the request's route sets, never one its Content-Type picks, since a client writes that header.
// Otherwise a client could claim a larger body limit for any request by sending a file upload's Content-Type.
// A request whose declared body is over the limit is refused with `413` before any handler reads it.
// A body with no declared length is counted as a handler reads it, and a read past the limit fails with `413`
const requestSizeLimiter: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.requestSizeLimiter) return;

  const { method } = event.req;
  const contentLength = event.req.headers.get("content-length");
  if (checkIsRequestTooLarge(method, contentLength, rules.requestSizeLimiter))
    throw new HTTPError({ status: 413, statusText: "Payload Too Large" });

  if (checkIsBodyCounted(method, contentLength)) assertBodySize(event, rules.requestSizeLimiter.maxRequestSizeInBytes);
});

export default requestSizeLimiter;
