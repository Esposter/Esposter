import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { SecurityRouteRules } from "#src/models/SecurityRouteRules";
import type { RouteRuleConfig } from "h3/rules";

import { moduleOptionsSchema } from "#src/schemas/moduleOptionsSchema";
import { formatZodIssues } from "#src/services/formatZodIssues";
import { mergeModuleOptions } from "#src/services/mergeModuleOptions";

// Each route rule's `security` key, validated, keyed by the route pattern it belongs to.
// It is checked as the module's options with that route's overrides laid over them, so a route cannot set an option the module would refuse.
// A route rule with no `security` key is left out, so it adds no entry to the route table
export const getRouteSecurityRules = (
  routeRules: Record<string, RouteRuleConfig>,
  options: ModuleOptions,
): Record<string, SecurityRouteRules> => {
  const routeSecurityRules: Record<string, SecurityRouteRules> = {};
  for (const [route, { security }] of Object.entries(routeRules)) {
    if (security === undefined) continue;

    // A route rule is read by every request that matches it, so a credential written there would reach each of them
    if (Object.hasOwn(security, "basicAuth"))
      throw new TypeError(`nuxt-security-module: route ${route}: basicAuth cannot be set in a route rule`);

    const result = moduleOptionsSchema.safeParse(mergeModuleOptions(options, security));
    if (!result.success)
      throw new TypeError(`nuxt-security-module: route ${route}: ${formatZodIssues(result.error.issues)}`);
    routeSecurityRules[route] = security;
  }

  return routeSecurityRules;
};
