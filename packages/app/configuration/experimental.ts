import type { NuxtConfig } from "nuxt/schema";

export const experimental: NuxtConfig["experimental"] = {
  // @TODO: Remove this when it becomes stable in nuxt
  inlineRouteRules: true,
};
