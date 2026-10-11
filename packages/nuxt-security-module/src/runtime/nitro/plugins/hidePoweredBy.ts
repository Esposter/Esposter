import { definePlugin } from "nitro";
import type { NitroAppPlugin } from "nitro/types";
import { isEvent } from "nitro/h3";

import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

// The framework's own `X-Powered-By` header is removed from the response, whatever casing the framework wrote it in.
// Headers are compared without regard to case, so any casing of it is removed.
const hidePoweredBy: NitroAppPlugin = definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", (_response, event) => {
    // The hook is typed with the request-only event, which the framework hands over as the full event it is
    if (!isEvent(event)) return;

    const rules = getSecurityRules(event);
    if (rules?.enabled && rules.hidePoweredBy) event.res.headers.delete("x-powered-by");
  });
});

export default hidePoweredBy;
