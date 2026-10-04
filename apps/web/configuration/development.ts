import type { NuxtConfig } from "nuxt/schema";

// Nuxt DevTools draws its button with a logo from nuxt.com
const NUXT_BASE_URL = "https://nuxt.com";
// Merged over the rest of the configuration under `nuxt dev`, arrays appended to
export const development: NuxtConfig["$development"] = {
  security: { headers: { contentSecurityPolicy: { "img-src": [NUXT_BASE_URL] } } },
};
