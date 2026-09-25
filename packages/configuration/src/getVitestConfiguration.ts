import type { ViteUserConfig } from "vitest/config";

import { SOURCE_CONDITION } from "#src/constants";
import { getBenchmarkTestConfiguration } from "#src/getBenchmarkTestConfiguration";
import { getVitestProjectName } from "#src/getVitestProjectName";
import { getVueTestConfiguration } from "#src/getVueTestConfiguration";
import { defaultServerConditions } from "vite";

// `projectDirectory` is the caller's own `import.meta.dirname`, and only the repository-root config — which is
// The `projects` list rather than a project — has none to give. `projectTestConfiguration` is the member's own test
// Options, taken here rather than spread over the result so the one order that matters is written once: the
// Member's options over the shared ones, and a bench run's over both.
export const getVitestConfiguration = (
  projectDirectory?: string,
  projectTestConfiguration: NonNullable<ViteUserConfig["test"]> = {},
): ViteUserConfig => ({
  resolve: {
    // Opts into the arm a workspace package exports its own TypeScript under, so a test runs against a
    // Sibling's source rather than whatever its `dist` happened to hold when it was last built. Vite's own
    // Defaults are spread back in because this field replaces them rather than adding to it — dropping
    // `module` and `node` silently re-resolves half the dependency tree.
    conditions: [SOURCE_CONDITION, ...defaultServerConditions],
  },
  test: {
    // Transforming the module graph is the largest share of a run and is otherwise redone from scratch every
    // Time; persisting it to `node_modules/.vitest-cache` reuses it across reruns and separate processes, and
    // A reinstall drops the directory along with the dependencies it was keyed on.
    fsModuleCache: true,
    // A `beforeAll` booting PGlite takes well under a second on an idle machine and several on a loaded one,
    // Because a run spawns a worker per file and they compete for cores — the 10s default is a starvation
    // Detector rather than a hook bound, and this is the one setting that keeps a green suite green
    hookTimeout: Temporal.Duration.from({ minutes: 1 }).total("milliseconds"),
    ...(projectDirectory ? { name: getVitestProjectName(projectDirectory) } : {}),
    // Restores every vi.stubEnv after the test that set it, so no file needs its own unstubAllEnvs teardown.
    // The globals equivalent stays off: a beforeAll stubGlobal is restored after the first test, not the file.
    unstubEnvs: true,
    ...getVueTestConfiguration(),
    ...projectTestConfiguration,
    // Last, because it raises every timeout above — the member's own included — for a bench run, and spreads
    // Nothing outside one.
    ...getBenchmarkTestConfiguration(),
  },
});
