import { createRouteRulesPlugin } from "nuxt-security-module/runtime/nitro/plugins/routeRules";
import { describe } from "vitest";

// Resolves the route rules the way the module's Nitro plugin does on the first request, so a test's rules answer its
// Requests as they would in the app. The plugin's only dependencies on the app are the request hook it registers and
// The routeRules hook it calls, which has no listener here
export const resolveRouteRules = async (rules: Parameters<typeof createRouteRulesPlugin>[0]): Promise<void> => {
  let resolveRoutes: (() => Promise<void>) | undefined;
  const routeRulesPlugin = createRouteRulesPlugin(rules);
  await routeRulesPlugin({
    hooks: {
      callHook: () => Promise.resolve(),
      hook: (_name: string, handler: () => Promise<void>) => {
        resolveRoutes = handler;
      },
    },
  } as unknown as Parameters<typeof routeRulesPlugin>[0]);
  await resolveRoutes?.();
};

describe.todo("resolveRouteRules");
