import type { UserConfig } from "tsdown";

import { SNAPSHOT_FILENAME } from "#src/constants";
import { DISTRIBUTION_DIRECTORY, getTsdownConfigurationNode } from "@esposter/configuration";
import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { mergeConfig } from "tsdown";

// Rolldown bundles JS only, so the pre-migrated PGlite data directory snapshot `createMockDb` opens has to be
// Placed beside the bundle by hand. That belongs to the build rather than to a step chained after it in the
// Manifest: a chained step runs for `pnpm build` and for nothing else, so every other way of building this
// Package — `tsdown --watch`, which is what `watch:packages` runs — wrote a `dist` missing the one file it
// Needs, and the failure surfaces in whatever opened the mock rather than in the build that made it.
//
// Merged rather than spread, so this `hooks` object joins the base's `build:prepare` barrel generation instead
// Of replacing it.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  hooks: {
    "build:done": () => {
      copyFileSync(join("src", SNAPSHOT_FILENAME), join(DISTRIBUTION_DIRECTORY, SNAPSHOT_FILENAME));
    },
  },
});

export default tsdownConfiguration;
