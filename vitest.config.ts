import type { ViteUserConfig } from "vitest/config";

import { DurationSequencer, getVitestConfiguration, parseWorkspacePackageGlobs } from "@esposter/configuration";
import { WORKSPACE_FILE } from "@esposter/configuration/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const baseVitestConfiguration = getVitestConfiguration();
const vitestConfiguration: ViteUserConfig = defineConfig({
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    // Every workspace member, read off the globs `pnpm-workspace.yaml` declares rather than repeated: a copy is a
    // Member this run silently stops covering the day one is added outside the listed roots. Each member configures
    // Its own project, so nothing here knows what any of them contains.
    projects: [...parseWorkspacePackageGlobs(readFileSync(resolve(import.meta.dirname, WORKSPACE_FILE), "utf8"))],
    // A coverage shard takes its files by the durations CI recorded, not by count (`DurationSequencer`)
    sequence: { ...baseVitestConfiguration.test?.sequence, sequencer: DurationSequencer },
  },
});

export default vitestConfiguration;
