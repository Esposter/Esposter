import {
  CATALOG_PACKAGE_INDENT,
  CATALOGS_SECTION_ENDS,
  CATALOGS_SECTION_START,
  IMPORTER_PACKAGE_INDENT,
  IMPORTERS_SECTION_ENDS,
  IMPORTERS_SECTION_START,
} from "#src/services/outdatedDependencies/lock/constants";
import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";
import { LOCKFILE_PATH } from "#src/services/shared/constants";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { readFileSync } from "node:fs";
import { test } from "vitest";
// `parseLockResolvedVersions` is the only unit in the dependency check whose input scales — it runs a
// Global regex over slices of the ~29k-line `pnpm-lock.yaml` (every other helper parses the ~250-line
// Workspace yaml or is an fs/leaf op). The two real call sites are benched against the actual committed
// Lock: the `catalogs:` slice carries the bulk of resolved versions (the baseline, real work), while the
// `importers:` slice is small — the contrast makes per-input cost visible, so a regex regression (e.g.
// Catastrophic backtracking) on a growing lock shows up. Slices are built once at module scope: they are read
// And never written, so every iteration can share them.
const lockYaml = readFileSync(LOCKFILE_PATH, "utf8");
const catalogSection = sliceLockSection(lockYaml, CATALOGS_SECTION_START, CATALOGS_SECTION_ENDS);
const importersSection = sliceLockSection(lockYaml, IMPORTERS_SECTION_START, IMPORTERS_SECTION_ENDS);

test(parseLockResolvedVersions, async ({ bench }) => {
  await bench.compare(
    bench("catalogs section", () => {
      parseLockResolvedVersions(catalogSection, CATALOG_PACKAGE_INDENT);
    }),
    bench("importers section", () => {
      parseLockResolvedVersions(importersSection, IMPORTER_PACKAGE_INDENT);
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});
