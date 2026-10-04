import type { NuxtConfigInput } from "nuxt/schema";

// Nuxt DevTools draws its button with a logo from nuxt.com
const NUXT_BASE_URL = "https://nuxt.com";
// The UnoCSS inspector's DevTools tab draws its icon from unocss.dev
const UNOCSS_BASE_URL = "https://unocss.dev";
// Merged over the rest of the configuration under `nuxt dev`, arrays appended to
export const development: NuxtConfigInput["$development"] = {
  security: { headers: { contentSecurityPolicy: { "img-src": [NUXT_BASE_URL, UNOCSS_BASE_URL] } } },
};
