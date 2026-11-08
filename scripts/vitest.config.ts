import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

// The factory names a project after `<workspace directory>/<package directory>`, which is how `--project` and
// `--filter` select the same set. This member sits at the repository root rather than under one of the two
// Workspace directories, so there is no pair to name it by and the name is its directory alone.
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  name: "scripts",
  // With every shard's workers sharing a runner under coverage, a test that stamps files took 1.7, 4.2 and 5.2 seconds
  // In three runs of CI, so it failed on the run that crossed Vitest's 5 second default. The failure reads as a flaky
  // Test rather than one that was always near the line, so every test gets the headroom the runner actually needs
  testTimeout: Temporal.Duration.from({ seconds: 30 }).total("milliseconds"),
});

export default vitestConfiguration;
