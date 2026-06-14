import type { NuxtConfig } from "nuxt/schema";

export const experimental: NuxtConfig["experimental"] = {
  // Top-level await marks a component async, making props evaluate to undefined and triggering
  // `[Vue warn]: Invalid prop: type check failed`; asyncContext fixes that.
  asyncContext: true,
  inlineRouteRules: true,
  typescriptPlugin: true,
};
