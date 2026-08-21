import type { NuxtConfig } from "nuxt/schema";

export const router: NuxtConfig["router"] = {
  options: {
    // Nuxt's own scroll behaviour already resolves a route hash to its element and honours the heading's
    // Scroll margin, which is what clears the sticky app bar. Smoothness is the only thing it cannot infer, so
    // Setting it here is what lets every in-page anchor be a plain link rather than a prevented one driving its
    // Own scroll — see `packages/app/content/docs/architecture/navigation.md`
    scrollBehaviorType: "smooth",
  },
};
