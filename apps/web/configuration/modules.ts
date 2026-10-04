import type { NuxtConfig } from "nuxt/schema";
import type { ModuleOptions } from "trpc-nuxt-module";

import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "../app/services/trpc/constants.ts";

// Registered by its source rather than its package name: `nuxt prepare` loads every module from the app's
// `postinstall`, before any workspace package is built, and a name resolves to the `dist` a fresh clone does not have
// Yet. Its options are the router and context the generated handlers import, the endpoints they are registered at, and
// The Keep-alive the WebSocket handler pings its connections with
const trpcModule: [string, ModuleOptions] = [
  "../../packages/trpc-nuxt-module/src/module.ts",
  {
    createContext: { from: "~~/server/trpc/context", name: "createContext" },
    endpoint: TRPC_CLIENT_PATH,
    router: { from: "~~/server/trpc/routers", name: "trpcRouter" },
    webSocket: { endpoint: TRPC_WS_PATH, keepAlive: { enabled: true } },
  },
];
// Unit tests need only the modules whose runtime/auto-imports they actually exercise. The rest are
// SSR/build/styling concerns that don't run under Vitest but DO break or slow Nuxt config resolution —
// E.g. @vite-pwa/nuxt trips the Windows "filename must be a file URL" crash on its virtual register module (taking
// Down even pure-node tests) and builds a service worker, @nuxtjs/seo's nuxt-schema-org plugin
// Leaks an EnvironmentTeardownError after teardown, and nuxt-security adds headers/CSP nothing asserts.
// Allowlist instead of subtract: add a module to the Vitest branch only when a test needs it (then re-run).
export const modules: NuxtConfig["modules"] = process.env.VITEST
  ? ["@nuxt/image", "@nuxt/scripts", "@nuxt/test-utils/module", "@pinia/nuxt", "@vueuse/nuxt", trpcModule]
  : [
      "@nuxt/content",
      "@nuxt/eslint",
      "@nuxt/fonts",
      "@nuxt/image",
      "@nuxt/scripts",
      "@nuxt/test-utils/module",
      "@nuxtjs/seo",
      "@pinia/nuxt",
      "@tresjs/nuxt",
      "@unocss/nuxt",
      "@vite-pwa/nuxt",
      "@vueuse/nuxt",
      "nuxt-security",
      trpcModule,
    ];
