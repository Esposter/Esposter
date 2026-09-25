import { getBenchmarkTestConfiguration, getVitestConfiguration } from "@esposter/configuration";
import { defineVitestProject } from "@nuxt/test-utils/config";
// `defineVitestProject` builds its own config rather than taking the shared factory's, so the factory's test options
// Are spread in and only the app's own are written here: the project name every member is addressed by, the
// Persisted transform cache (which matters most for the app, whose module graph is the largest in the workspace),
// The Vue worker flags and the env stub reset all arrive with it. Its `resolve` is not taken: how the app reaches its
// Siblings is the Nuxt wiring's, which `defineVitestProject` resolves
const { test: workspaceTestConfiguration } = getVitestConfiguration(import.meta.dirname);
const vitestConfig = await defineVitestProject({
  test: {
    ...workspaceTestConfiguration,
    // Anything that signs with the app secret refuses to run without one, rather than quietly signing with an
    // Empty key — Nuxt coerces an unset runtimeConfig value to "", which `createHmac` accepts, so the failure
    // Would otherwise be a forgeable token in production and nothing at all in a test.
    env: { BETTER_AUTH_SECRET: "mock-auth-secret" },
    // Root the Nuxt project at this package, not the vitest cwd (the repo root, where `@nuxt/kit` and the
    // App don't resolve) — the run is driven by the root `projects` config.
    environmentOptions: { nuxt: { rootDir: import.meta.dirname } },
    // Cold `setupNuxt()` (the nuxt-env `beforeAll`) builds Nuxt on first use, which can exceed several minutes
    // On a loaded CI runner and trips "Hook timed out". 5 min gives the cold build ample headroom.
    hookTimeout: Temporal.Duration.from({ minutes: 5 }).total("milliseconds"),
    // DOM globals come from the nuxt environment itself: nuxt-env tests (`// @vitest-environment nuxt`)
    // Build their own happy-dom window, so no manual happy-dom registration is needed, and tests in
    // The node environment run without a DOM. `fake-indexeddb/auto` polyfills the IDB* global
    // Constructors the `idb` library needs (the nuxt env's indexedDb mock only sets `indexedDB`); it's
    // Cheap and harmless for node tests, so it stays global.
    setupFiles: ["fake-indexeddb/auto", "./shared/test/setup.ts"],
    // A `mountSuspended` in the nuxt environment costs a few seconds on its own, so a component test sits close
    // To Vitest's 5s default before the run is even parallel — and with sixteen workers sharing a machine the
    // Slowest of them tips over it. The failure reads as a flaky component rather than as a test that was
    // Always near the line, so give every test the headroom the environment actually needs
    testTimeout: Temporal.Duration.from({ seconds: 30 }).total("milliseconds"),
    // Again after the app's own timeouts, which would otherwise win over the ones a bench run raises — the shared
    // Options above already carry it, but ahead of them
    ...getBenchmarkTestConfiguration(),
  },
});
// `defineVitestProject` is `resolveConfig` (all the nuxt wiring: plugins, aliases, runtime entry setup
// File, environmentOptions) plus one hardcoded `environment = "nuxt"` for every file. Restore the node
// Default so only `// @vitest-environment nuxt` files pay the nuxt environment cost — the wiring stays
// Intact, so per-file directives still resolve the nuxt environment.
vitestConfig.test ??= {};
vitestConfig.test.environment = "node";

export default vitestConfig;
