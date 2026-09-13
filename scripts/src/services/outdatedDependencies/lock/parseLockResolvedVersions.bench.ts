import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";
// `parseLockResolvedVersions` is the only unit in the dependency check whose input scales — it runs a
// Global regex over slices of the ~29k-line `pnpm-lock.yaml` (every other helper parses the ~250-line
// Workspace yaml or is an fs/leaf op). The two real call sites are benched against the actual committed
// Lock: the `catalogs:` slice carries the bulk of resolved versions (the baseline, real work), while the
// `importers:` slice is small — the contrast makes per-input cost visible, so a regex regression (e.g.
// Catastrophic backtracking) on a growing lock shows up. Slices are built once at module scope: they are read
// And never written, so every iteration can share them.
const lockYaml = readFileSync(resolve(REPOSITORY_ROOT, "pnpm-lock.yaml"), "utf8");
const catalogSection = sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]);
const importersSection = sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]);

test(parseLockResolvedVersions, async ({ bench }) => {
  await bench.compare(
    bench("catalogs section", () => {
      parseLockResolvedVersions(catalogSection, 4);
    }),
    bench("importers section", () => {
      parseLockResolvedVersions(importersSection, 6);
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});
