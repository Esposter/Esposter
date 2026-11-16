import type { Middleware } from "nitro/h3";

import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { defineMiddleware } from "nitro";
import { handleCors } from "nitro/h3";

// CORS headers for the request's origin, and a preflight answered without reaching a handler
const corsHandler: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.corsHandler) return undefined;

  const { allowHeaders, credentials, exposeHeaders, maxAge, methods, origin, preflight } = rules.corsHandler;
  const response = handleCors(event, {
    ...(allowHeaders === undefined ? {} : { allowHeaders }),
    ...(credentials === undefined ? {} : { credentials }),
    // H3 exposes every header when the option is left out, while an unset option of this module exposes none
    exposeHeaders: exposeHeaders ?? [],
    ...(maxAge === undefined ? {} : { maxAge }),
    methods,
    origin: [origin].flat(),
    ...(preflight === undefined ? {} : { preflight }),
  });
  // A preflight is answered here, so its response is returned for h3 to send. Any other request falls through to its handler
  return response === false ? undefined : response;
});

export default corsHandler;
