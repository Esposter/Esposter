import { getVitestConfiguration } from "@esposter/configuration";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { configDefaults } from "vitest/config";

import { getNuxtEnvironmentOptions } from "./configuration/nuxtEnvironmentOptions.ts";

// `defineVitestProject` builds its own config rather than taking the shared factory's, so the factory's test options
// Are handed in and only the app's own are written here: the project name every member is addressed by, the
// Persisted transform cache (which matters most for the app, whose module graph is the largest in the workspace),
// The Vue worker flags, the env stub reset and a bench run's timeouts all arrive with it. The app's options go
// Through the factory rather than over its result, which lays them over the shared ones and under a bench run's.
// Its `resolve` is not taken: how the app reaches its siblings is the Nuxt wiring's, which `defineVitestProject`
// Resolves
const { test } = getVitestConfiguration(import.meta.dirname, {
  // Anything that signs with the app secret refuses to run without one, rather than quietly signing with an
  // Empty key — Nuxt coerces an unset runtimeConfig value to "", which `createHmac` accepts, so the failure
  // Would otherwise be a forgeable token in production and nothing at all in a test.
  env: { BETTER_AUTH_SECRET: "mock-auth-secret" },
  environmentOptions: getNuxtEnvironmentOptions(import.meta.dirname),
  // A `*.browser.test.ts` runs in the browser suite alone (`vitest.browser.config.ts`), where a layout engine draws it
  exclude: [...configDefaults.exclude, "**/*.browser.test.ts"],
  // Cold `setupNuxt()` (the nuxt-env `beforeAll`) builds Nuxt on first use, which can exceed several minutes
  // On a loaded CI runner and trips "Hook timed out". 5 min gives the cold build ample headroom.
  hookTimeout: Temporal.Duration.from({ minutes: 5 }).total("milliseconds"),
  // DOM globals come from the nuxt environment itself: nuxt-env tests (`// @vitest-environment nuxt`)
  // Build their own happy-dom window, so no manual happy-dom registration is needed, and tests in
  // The node environment run without a DOM. Neither environment has IndexedDB at all, so `fake-indexeddb/auto`
  // Installs `indexedDB` and the IDB* constructors the app's IndexedDB cache needs; it's cheap and harmless where unused,
  // So it stays global.
  setupFiles: ["fake-indexeddb/auto", "./shared/test/setup.ts"],
  // A `mountSuspended` in the nuxt environment costs a few seconds on its own, so a component test sits close
  // To Vitest's 5s default before the run is even parallel — and with sixteen workers sharing a machine the
  // Slowest of them tips over it. The failure reads as a flaky component rather than as a test that was
  // Always near the line, so give every test the headroom the environment actually needs
  testTimeout: Temporal.Duration.from({ seconds: 30 }).total("milliseconds"),
});
const vitestConfig = await defineVitestProject({ test });
// `defineVitestProject` is `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup
// File, environmentOptions) plus one hardcoded `environment = "nuxt"` for every file. Restore the node
// Default so only `// @vitest-environment nuxt` files pay the nuxt environment cost — the wiring stays
// Intact, so per-file directives still resolve the nuxt environment.
vitestConfig.test ??= {};
vitestConfig.test.environment = "node";

export default vitestConfig;
