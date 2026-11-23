import type { SecurityRules } from "#src/models/SecurityRules";
import type { H3Event } from "nitro/h3";
import type { NitroAppPlugin } from "nitro/types";

import { ROUTE_RULES_HOOK } from "#src/runtime/constants";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { setSecurityRouteMatcher, setSecurityRouteMatcherFailure } from "#src/runtime/services/securityRouteMatcher";
import { serializeSecurityHeaders } from "#src/runtime/services/serializeSecurityHeaders";
import { getStaticResourceHeaders } from "#src/services/getStaticResourceHeaders";
import { definePlugin } from "nitro";

// The plugin the module's server template calls with the build's route rules.
// The app's hook is called on the first request, not at setup. The app's own server plugins register their listeners
// After this one, so a call at setup would reach none of them. Every request then matches the resolved rules
// Without copying them again.
// A failure is recorded here, as the request hook's own rejection is swallowed and the request served without its rules
export const createRouteRulesPlugin = (routeRules: Record<string, SecurityRules>): NitroAppPlugin =>
  definePlugin((nitroApp) => {
    const resolveRouteRules = async (): Promise<void> => {
      const routes = structuredClone(routeRules);
      await nitroApp.hooks.callHook(ROUTE_RULES_HOOK, routes);
      setSecurityRouteMatcher(routes);
    };
    let routesResolved: Promise<void> | undefined;
    nitroApp.hooks.hook("request", () => {
      routesResolved ??= (async () => {
        const [resolution] = await Promise.allSettled([resolveRouteRules()]);
        if (resolution.status === "rejected") setSecurityRouteMatcherFailure(resolution.reason);
      })();
      return routesResolved;
    });
  });

// The headers a response the server writes itself carries under a path, which no page renders: the path's resolved resource
// Headers, and the embedder policy its pages send, which a dedicated worker's script is refused without. Empty before the
// Route rules resolve, and when none match the path
export const getResourceHeaders = (event: H3Event): Record<string, string> => {
  const headers = getSecurityRules(event)?.headers;
  if (!headers) return {};

  return {
    ...getStaticResourceHeaders(headers),
    ...serializeSecurityHeaders({ crossOriginEmbedderPolicy: headers.crossOriginEmbedderPolicy }),
  };
};
