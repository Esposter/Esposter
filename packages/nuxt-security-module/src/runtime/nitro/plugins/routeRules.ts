import type { SecurityRules } from "#src/models/SecurityRules";
import type { NitroAppPlugin } from "nitro/types";

import { definePlugin } from "nitro";

import { ROUTE_RULES_HOOK } from "#src/runtime/constants";
import { setSecurityRouteMatcher } from "#src/runtime/services/securityRouteMatcher";

// The plugin the module's server template calls with the build's route rules.
// It resolves them once at startup, handing them to the app's own hook to add to or change.
// Every request then matches them without copying them again.
export const createRouteRulesPlugin = (routeRules: Record<string, SecurityRules>): NitroAppPlugin =>
  definePlugin(async (nitroApp) => {
    const routes = structuredClone(routeRules);
    await nitroApp.hooks.callHook(ROUTE_RULES_HOOK, routes);
    setSecurityRouteMatcher(routes);
  });
