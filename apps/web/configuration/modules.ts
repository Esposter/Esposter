import type { NuxtConfig } from "nuxt/schema";
import type { ModuleOptions } from "trpc-nuxt-module";

import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "../app/services/trpc/constants.ts";

// The workspace's own modules are registered by their source rather than their package name: `nuxt prepare` loads every
// Module from the app's `postinstall`, before any workspace package is built, and a name resolves to the `dist` a fresh
// Clone does not have yet
const NUXT_SECURITY_MODULE_PATH = "../../packages/nuxt-security-module/src/module.ts";
const TRESJS_NUXT_MODULE_PATH = "../../packages/tresjs-nuxt/src/module.ts";
// The tRPC module's options are the router and context the generated handlers import, the endpoints they are
// Registered at, and the keep-alive the WebSocket handler pings its connections with
const trpcNuxtModule: [string, ModuleOptions] = [
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
// Leaks an EnvironmentTeardownError after teardown, and nuxt-security-module adds headers/CSP nothing asserts.
export const nonVitestModules: NonNullable<NuxtConfig["modules"]> = [
  "@nuxt/eslint",
  "@nuxt/fonts",
  "@nuxt/image",
  "@nuxt/scripts",
  "@nuxt/test-utils/module",
  "@nuxtjs/seo",
  "@pinia/nuxt",
  "@unocss/nuxt",
  "@vite-pwa/nuxt",
  "@vueuse/nuxt",
  NUXT_SECURITY_MODULE_PATH,
  TRESJS_NUXT_MODULE_PATH,
  trpcNuxtModule,
];
// Allowlist instead of subtract: add a module to the Vitest branch only when a test needs it (then re-run).
export const modules: NuxtConfig["modules"] = process.env.VITEST
  ? ["@nuxt/image", "@nuxt/scripts", "@nuxt/test-utils/module", "@pinia/nuxt", "@vueuse/nuxt", trpcNuxtModule]
  : nonVitestModules;
