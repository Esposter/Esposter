import type { ViteUserConfig } from "vitest/config";

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
// The visual suite: the real app built once and opened in a real browser through @nuxt/test-utils' end-to-end mode,
// Its screenshots compared against approved baselines. It costs a production build, so it runs on its own through
// `test:visual` — the default config excludes it — once at the end of a visual change rather than on every run. It
// Lives outside `app/`: a test build un-ignores `*.test.*` files, so a suite under `pages/` becomes a route
const visualVitestConfiguration: ViteUserConfig = defineConfig({
  resolve: { alias: { "@": resolve(import.meta.dirname, "app") } },
  test: {
    hookTimeout: Temporal.Duration.from({ minutes: 20 }).total("milliseconds"),
    include: ["visual/**/*.visual.test.ts"],
    testTimeout: Temporal.Duration.from({ minutes: 2 }).total("milliseconds"),
  },
});

export default visualVitestConfiguration;
