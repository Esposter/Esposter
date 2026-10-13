import type { SecurityRules } from "#src/models/SecurityRules";
import type { NitroAppPlugin } from "nitro/types";

import { ROUTE_RULES_HOOK } from "#src/runtime/constants";
import { setSecurityRouteMatcher } from "#src/runtime/services/securityRouteMatcher";
import { definePlugin } from "nitro";

// The plugin the module's server template calls with the build's route rules.
// The app's hook is called on the first request, not at setup. The app's own server plugins register their listeners
// After this one, so a call at setup would reach none of them. Every request then matches the resolved rules
// Without copying them again.
export const createRouteRulesPlugin = (routeRules: Record<string, SecurityRules>): NitroAppPlugin =>
  definePlugin((nitroApp) => {
    let routesResolved: Promise<void> | undefined;
    nitroApp.hooks.hook("request", () => {
      routesResolved ??= (async () => {
        const routes = structuredClone(routeRules);
        await nitroApp.hooks.callHook(ROUTE_RULES_HOOK, routes);
        setSecurityRouteMatcher(routes);
      })();
      return routesResolved;
    });
  });
