import type { Middleware } from "nitro/h3";

import { defineMiddleware } from "nitro";
import { handleCors } from "nitro/h3";

import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

// CORS headers for the request's origin, and a preflight answered without reaching a handler
const corsHandler: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.corsHandler) return;

  const { allowHeaders, credentials, exposeHeaders, maxAge, methods, origin, preflight } = rules.corsHandler;
  handleCors(event, {
    allowHeaders,
    credentials,
    exposeHeaders,
    maxAge,
    methods,
    origin: origin === "*" ? "*" : [origin].flat(),
    preflight,
  });
});

export default corsHandler;
