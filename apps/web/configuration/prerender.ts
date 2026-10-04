import type { NuxtConfig } from "nuxt/schema";

export const prerender: NuxtConfig["prerender"] = {
  // @TODO: no upstream issue — @nuxt/content's node dump handler reads Nitro 2's build-time `build:` storage, so its
  // Prerender answers 503 on Nitro 3; unprerendered, the handler serves the dump from the bundled copy instead
  ignore: ["/__nuxt_content/"],
};
