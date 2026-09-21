import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration, parseWorkspacePackageGlobs, WORKSPACE_FILE } from "@esposter/configuration";
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
    projects: parseWorkspacePackageGlobs(readFileSync(resolve(import.meta.dirname, WORKSPACE_FILE), "utf8")),
  },
});

export default vitestConfiguration;
