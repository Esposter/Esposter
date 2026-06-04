import type { NuxtConfig } from "nuxt/schema";

export const experimental: NuxtConfig["experimental"] = {
  // Fixes [Vue warn]: Invalid prop: type check failed for prop "...". Expected {Type}, got Undefined
  // Due to top-level await statements marking the component as async and can cause props to evaluate to undefined
  asyncContext: true,
  inlineRouteRules: true,
  typescriptPlugin: true,
};
