import type { NitroAppPlugin } from "nitro/types";

import { CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER_NAME, SECURITY_HEADER_NAMES } from "#src/runtime/constants";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { getSecurityState } from "#src/runtime/services/getSecurityState";
import { serializeSecurityHeaders } from "#src/runtime/services/serializeSecurityHeaders";
import { updateContentSecurityPolicy } from "#src/runtime/services/updateContentSecurityPolicy";
import { definePlugin } from "nitro";

const CONTENT_SECURITY_POLICY_HEADER_NAME = SECURITY_HEADER_NAMES.contentSecurityPolicy;

// Every rendered page carries the headers its route's rules set.
// The policy's placeholders are filled from this request.
// The headers are set on `render:route`, before the page renders.
// Server routes get the static subset through Nitro's route rules instead.
// The nonce is read from the state the nonce plugin wrote on the same hook.
// That is why that plugin is registered first.
const securityHeaders: NitroAppPlugin = definePlugin((nitroApp) => {
  nitroApp.hooks.hook("render:route", (_context, { event }) => {
    const rules = getSecurityRules(event);
    if (!rules?.enabled || !rules.headers) return;

    const { contentSecurityPolicy } = rules.headers;
    const serializedHeaders = serializeSecurityHeaders({
      ...rules.headers,
      contentSecurityPolicy: contentSecurityPolicy
        ? updateContentSecurityPolicy(contentSecurityPolicy, getSecurityState(event))
        : false,
    });
    for (const [name, value] of Object.entries(serializedHeaders)) {
      const isPolicy = name === CONTENT_SECURITY_POLICY_HEADER_NAME;
      event.res.headers.set(
        isPolicy && rules.contentSecurityPolicyReportOnly ? CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER_NAME : name,
        value,
      );
    }
  });
});

export default securityHeaders;
