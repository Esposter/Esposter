import type { SecurityRules } from "#src/models/SecurityRules";

// The module's own runtime hook, typed for this package's typecheck.
// The typing matches how the app's generated types type it for an app.
declare module "nitro/types" {
  interface NitroRuntimeHooks {
    "nuxt-security-module:routeRules": (routeRules: Record<string, SecurityRules>) => Promise<void> | void;
  }
}
