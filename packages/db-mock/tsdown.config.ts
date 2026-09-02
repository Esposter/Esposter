import type { UserConfig } from "tsdown";

import { SNAPSHOT_FILENAME } from "#src/constants";
import { DISTRIBUTION_DIRECTORY, getTsdownConfigurationNode } from "@esposter/configuration";
import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { mergeConfig } from "tsdown";

// Rolldown bundles JS only, so the pre-migrated PGlite data directory snapshot `createMockDb` opens is copied
// Beside the bundle. It belongs to the build rather than to a step chained after it in the manifest: a chained
// Step runs for `pnpm build` and nothing else, so `tsdown --watch` writes a `dist` missing the one file it
// Needs, and the failure surfaces in whatever opened the mock rather than in the build that made it. Merged
// Rather than spread, so this `hooks` object joins the base's `build:prepare` barrel generation.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  hooks: {
    "build:done": () => {
      copyFileSync(join("src", SNAPSHOT_FILENAME), join(DISTRIBUTION_DIRECTORY, SNAPSHOT_FILENAME));
    },
  },
});

export default tsdownConfiguration;
