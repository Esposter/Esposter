import type { ViteUserConfig } from "vitest/config";

import { AGENT_DIRECTORY, AGENT_WORKTREES_DIRECTORY, getVitestConfiguration } from "@esposter/configuration";
import { defaultExclude, defineConfig } from "vitest/config";

const baseVitestConfiguration = getVitestConfiguration();
// Unlike `include`, `exclude` replaces its default rather than adding to it, so the defaults are spread back in.
const agentExclude = [...defaultExclude, `${AGENT_WORKTREES_DIRECTORY}/**`, ".claude/**"];
const vitestConfiguration: ViteUserConfig = defineConfig({
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    projects: [
      "packages/*",
      // The root `scripts/` suite is not a workspace package, so it needs its own project entry;
      // `extends: true` inherits this file's shared base (tsconfig paths, hook timeout). Scope both the
      // Test and benchmark globs to `scripts/` — `benchmark.include` defaults to `**/*.bench.ts`, which
      // Would otherwise pull every package's bench file into this project on `vitest bench --project scripts`.
      {
        extends: true,
        test: {
          benchmark: { include: ["scripts/**/*.bench.ts"] },
          include: ["scripts/**/*.test.ts"],
          name: "scripts",
        },
      },
      // The workflow scripts under `.agents/` are not a workspace package either. They cannot be imported or
      // Split into modules — they are async function bodies the harness injects globals into — so their tests
      // Load the real file and drive it with stubbed agents, which is the only way to pin the decisions a review
      // Makes without spawning one. Both globs are scoped for the same reason as `scripts` above: an unscoped
      // `benchmark.include` inherits `**/*.bench.ts` and re-collects every package's benches under this project.
      // `.agents/**` also reaches into agent worktrees, which `AGENT_WORKTREES_DIRECTORY` excludes — see its comment —
      // And the `.claude` alias, which globbers follow back into the same tree under a second name.
      {
        extends: true,
        test: {
          benchmark: { exclude: agentExclude, include: [`${AGENT_DIRECTORY}/**/*.bench.ts`] },
          exclude: agentExclude,
          include: [`${AGENT_DIRECTORY}/**/*.test.ts`],
          name: "agents",
        },
      },
    ],
  },
});

export default vitestConfiguration;
