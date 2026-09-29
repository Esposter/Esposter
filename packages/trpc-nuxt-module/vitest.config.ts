import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { resolve } from "node:path";

// The client runtime is composables over Nuxt's own `useAsyncData`, so its suites run inside a Nuxt app — the fixture,
// Nuxt's own recommendation for testing a module — and only the files that say `// @vitest-environment nuxt` pay for
// It. Everything else, the server runtime and the module, runs in node as `defineVitestProject` would otherwise not
const { test } = getVitestConfiguration(import.meta.dirname, {
  environmentOptions: { nuxt: { rootDir: resolve(import.meta.dirname, "test/fixture") } },
});
const vitestConfiguration: ViteUserConfig = await defineVitestProject({ test });
vitestConfiguration.test ??= {};
vitestConfiguration.test.environment = "node";

export default vitestConfiguration;
