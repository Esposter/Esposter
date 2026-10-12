import type { NuxtConfig } from "nuxt/schema";

// @nuxtjs/seo installs nuxt-skew-protection since v6; off, since CI keeps no earlier build's assets for it to serve
export const skewProtection: NuxtConfig["skewProtection"] = false;
