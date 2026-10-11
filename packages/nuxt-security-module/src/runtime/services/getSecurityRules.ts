import type { SecurityRules } from "#src/models/SecurityRules";
import type { H3Event } from "nitro/h3";

import { mergeSecurityRules } from "#src/runtime/services/mergeSecurityRules";
import { findSecurityRules } from "#src/runtime/services/securityRouteMatcher";

// Each request's rules are merged once and kept beside the event rather than on it.
// So the event's own context is left as it was handed over.
const securityRulesByEvent = new WeakMap<H3Event, SecurityRules>();

// The rules that apply to the event's path, merged most specific first.
// `undefined` only before the route rules have been resolved at startup.
// The module's plugins guarantee that happens before the first request.
export const getSecurityRules = (event: H3Event): SecurityRules | undefined => {
  const cachedRules = securityRulesByEvent.get(event);
  if (cachedRules) return cachedRules;

  const matchedRules = findSecurityRules(event.url.pathname);
  if (!matchedRules) return undefined;

  const rules = mergeSecurityRules(...matchedRules.toReversed());
  securityRulesByEvent.set(event, rules);
  return rules;
};
