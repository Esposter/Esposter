import type { NuxtConfig } from "nuxt/schema";

// Off: a deploy builds on a fresh disk, so the module keeps no earlier build's assets, and it rewrites `builds/latest.json` and `builds/meta/` before Nuxt writes them again, leaving each served longer than its file
export const skewProtection: NuxtConfig["skewProtection"] = { enabled: false };
