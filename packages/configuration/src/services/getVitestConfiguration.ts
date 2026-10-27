import type { ViteUserConfig } from "vitest/config";

import { BROWSER_TEST_GLOB, SOURCE_CONDITION } from "#src/services/constants";
import { getBenchmarkTestConfiguration } from "#src/services/getBenchmarkTestConfiguration";
import { getVitestProjectName } from "#src/services/getVitestProjectName";
import { getVueTestConfiguration } from "#src/services/getVueTestConfiguration";
import { defaultServerConditions } from "vite";
import { configDefaults } from "vitest/config";

// `projectDirectory` is the caller's own `import.meta.dirname`, and only the repository-root config — which is
// The `projects` list rather than a project — has none to give. `projectTestConfiguration` is the member's own test
// Options, taken here rather than spread over the result so the one order that matters is written once: the
// Member's options over the shared ones, and a bench run's over both.
export const getVitestConfiguration = (
  projectDirectory?: string,
  projectTestConfiguration: NonNullable<ViteUserConfig["test"]> = {},
): ViteUserConfig => {
  const vueTestConfiguration = getVueTestConfiguration();
  return {
    resolve: {
      // Opts into the arm a workspace package exports its own TypeScript under, so a test runs against a
      // Sibling's source rather than whatever its `dist` happened to hold when it was last built. Vite's own
      // Defaults are spread back in because this field replaces them rather than adding to it — dropping
      // `module` and `node` silently re-resolves half the dependency tree.
      conditions: [SOURCE_CONDITION, ...defaultServerConditions],
    },
    test: {
      // Clears every mock's call history before each test, so a test reads the calls it made and not the ones an
      // Earlier test made. Only the history goes: a `vi.mock` default or a `mockResolvedValue` stays in place.
      clearMocks: true,
      exclude: [...configDefaults.exclude, BROWSER_TEST_GLOB],
      // Transforming the module graph is the largest share of a run and is otherwise redone from scratch every
      // Time; persisting it to `node_modules/.vitest-cache` reuses it across reruns and separate processes, and
      // A reinstall drops the directory along with the dependencies it was keyed on.
      fsModuleCache: true,
      // A `beforeAll` booting PGlite takes well under a second on an idle machine and several on a loaded one,
      // Because a run spawns a worker per file and they compete for cores — the 10s default is a starvation
      // Detector rather than a hook bound, and this is the one setting that keeps a green suite green
      hookTimeout: Temporal.Duration.from({ minutes: 1 }).total("milliseconds"),
      // The default leaves one core to the main process, which does little while the workers run, so a four-core
      // Runner ran three workers. Every core runs one, which is the faster run on the runners the suite is timed on
      maxWorkers: "100%",
      ...(projectDirectory ? { name: getVitestProjectName(projectDirectory) } : {}),
      silent: "passed-only",
      // Restores every vi.stubEnv before each test, so no file needs its own unstubAllEnvs teardown. The globals
      // Equivalent stays off: it would restore a beforeAll stubGlobal before the file's first test even runs.
      unstubEnvs: true,
      ...vueTestConfiguration,
      // Node's own Web Storage is on by default and, with no `--localstorage-file`, answers every read of the
      // `localStorage` global with `undefined` and a process warning. No member runs against it — the DOM
      // Environments bring their own storage — so it is switched off and the global is simply absent
      execArgv: ["--no-webstorage", ...vueTestConfiguration.execArgv],
      ...projectTestConfiguration,
      // Last, because it raises every timeout above — the member's own included — for a bench run, and spreads
      // Nothing outside one.
      ...getBenchmarkTestConfiguration(),
    },
  };
};
