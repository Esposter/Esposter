import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const baseVitestConfiguration = getVitestConfiguration(import.meta.dirname);
// The factory names a project after `<workspace directory>/<package directory>`, which is how `--project` and
// `--filter` select the same set. This member sits at the repository root rather than under one of the two
// Workspace directories, so there is no pair to name it by and the name is its directory alone.
const vitestConfiguration: ViteUserConfig = {
  ...baseVitestConfiguration,
  test: { ...baseVitestConfiguration.test, name: "scripts" },
};

export default vitestConfiguration;
