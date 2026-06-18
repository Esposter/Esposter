import type { NuxtConfig } from "nuxt/schema";
// The @nuxtjs/seo umbrella (sitemap, og-image, schema-org, site-config) is SSR/SEO-only and unused by
// unit tests — the only SEO composables we call (`useSeoMeta`, `useHead`) ship with Nuxt core, not this
// module. Worse, nuxt-schema-org's plugin fires an async chunk import that resolves *after* @nuxt/test-utils
// tears the Nuxt environment down, surfacing as an EnvironmentTeardownError unhandled rejection that fails
// the entire shard even though every test passes. Drop it under Vitest to remove the leak (and the noise).
export const modules: NuxtConfig["modules"] = [
  "@nuxt/eslint",
  "@nuxt/fonts",
  "@nuxt/scripts",
  "@nuxt/test-utils/module",
  ...(process.env.VITEST ? [] : ["@nuxtjs/seo"]),
  "@pinia/nuxt",
  "@tresjs/nuxt",
  "@unocss/nuxt",
  "@vite-pwa/nuxt",
  "@vueuse/nuxt",
  "nuxt-security",
  "vuetify-nuxt-module",
];
