import type { Middleware } from "nitro/h3";

import { defineMiddleware } from "nitro";
import { HTTPError } from "nitro/h3";

import { checkIsMethodAllowed } from "#src/runtime/services/checkIsMethodAllowed";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

// A request whose method is not listed is refused with `405` before any handler runs
const allowedMethodsRestricter: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.allowedMethodsRestricter) return;

  if (!checkIsMethodAllowed(event.req.method, rules.allowedMethodsRestricter.methods))
    throw new HTTPError({ status: 405, statusText: "Method not allowed" });
});

export default allowedMethodsRestricter;
