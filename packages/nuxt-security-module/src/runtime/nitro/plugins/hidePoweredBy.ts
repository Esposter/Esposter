import type { NitroAppPlugin } from "nitro/types";

import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { definePlugin } from "nitro";
import { isEvent } from "nitro/h3";

// The framework's own `X-Powered-By` header is removed from the response, whatever casing the framework wrote it in.
// Headers are compared without regard to case, so any casing of it is removed.
// The response is the one sent: the framework copies the event's headers into it when it builds it, so a header
// Written to the event after that copy is only removed from the response itself.
const hidePoweredBy: NitroAppPlugin = definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", (response, event) => {
    // The hook is typed with the request-only event, which the framework hands over as the full event it is
    if (!isEvent(event)) return;

    const rules = getSecurityRules(event);
    if (rules?.enabled && rules.hidePoweredBy) response.headers.delete("x-powered-by");
  });
});

export default hidePoweredBy;
