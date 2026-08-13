import type { Plugin } from "rolldown";

import { rmSync } from "node:fs";

import { DISTRIBUTION_DIRECTORY } from "./constants";
// Rolldown never clears `output.dir`, and every emitted chunk carries a content hash in its filename — so a
// Build whose chunks changed writes new files beside the previous ones instead of replacing them, forever.
// Left alone the orphans dwarf the real bundle (virrun accumulated ~90 MB of them against a ~1 MB output) and
// Any dist size measurement stops meaning anything. Wipe the directory once per build instead.
export const getCleanDistributionPlugin = (): Plugin => ({
  buildStart: () => {
    rmSync(DISTRIBUTION_DIRECTORY, { force: true, recursive: true });
  },
  name: "clean-distribution",
});
