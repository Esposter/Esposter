import type { ViteUserConfig } from "vitest/config";

import { SOURCE_CONDITION } from "#src/constants";
import { getBenchmarkTestConfiguration } from "#src/getBenchmarkTestConfiguration";
import { getVitestProjectName } from "#src/getVitestProjectName";
import { defaultServerConditions } from "vite";

// `projectDirectory` is the caller's own `import.meta.dirname`, and only the repository-root config — which is
// The `projects` list rather than a project — has none to give.
export const getVitestConfiguration = (projectDirectory?: string): ViteUserConfig => ({
  resolve: {
    // Opts into the arm a workspace package exports its own TypeScript under, so a test runs against a
    // Sibling's source rather than whatever its `dist` happened to hold when it was last built. Vite's own
    // Defaults are spread back in because this field replaces them rather than adding to it — dropping
    // `module` and `node` silently re-resolves half the dependency tree.
    conditions: [SOURCE_CONDITION, ...defaultServerConditions],
  },
  test: {
    hookTimeout: 60_000,
    ...(projectDirectory ? { name: getVitestProjectName(projectDirectory) } : {}),
    // Restores every vi.stubEnv after the test that set it, so no file needs its own unstubAllEnvs teardown.
    // The globals equivalent stays off: a beforeAll stubGlobal is restored after the first test, not the file.
    unstubEnvs: true,
    // Last, because it raises the timeouts above for a bench run and spreads nothing outside one.
    ...getBenchmarkTestConfiguration(),
  },
});
