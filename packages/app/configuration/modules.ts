import type { NuxtConfig } from "nuxt/schema";

// Unit tests need only the modules whose runtime/auto-imports they actually exercise. The rest are
// SSR/build/styling concerns that don't run under Vitest but DO break or slow Nuxt config resolution —
// E.g. @unocss/nuxt trips the Windows `spawn EPERM` / "filename must be a file URL" crash (taking down
// Even pure-node tests), @vite-pwa/nuxt builds a service worker, @nuxtjs/seo's nuxt-schema-org plugin
// Leaks an EnvironmentTeardownError after teardown, and nuxt-security adds headers/CSP nothing asserts.
// Allowlist instead of subtract: add a module to the Vitest branch only when a test needs it (then re-run).
export const modules: NuxtConfig["modules"] = process.env.VITEST
  ? ["@nuxt/test-utils/module", "@pinia/nuxt", "@vueuse/nuxt", "vuetify-nuxt-module"]
  : [
      "@nuxt/eslint",
      "@nuxt/fonts",
      "@nuxt/scripts",
      "@nuxt/test-utils/module",
      "@nuxtjs/seo",
      "@pinia/nuxt",
      "@tresjs/nuxt",
      "@unocss/nuxt",
      "@vite-pwa/nuxt",
      "@vueuse/nuxt",
      "nuxt-security",
      "vuetify-nuxt-module",
    ];
