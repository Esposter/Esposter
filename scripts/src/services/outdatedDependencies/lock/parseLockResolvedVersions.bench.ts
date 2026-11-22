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

// `parseLockResolvedVersions` is the only unit in the dependency check whose input scales. It runs a global regex over
// `pnpm-lock.yaml` slices, while every other helper parses the workspace yaml or is an fs/leaf op.
// The two real call sites are benched against the actual committed lock.
// The `catalogs:` slice carries the bulk of resolved versions (the baseline, real work).
// The `importers:` slice is small, and the contrast makes per-input cost visible.
// A regex regression, such as catastrophic backtracking, shows up on a growing lock.
// Slices are built once at module scope: they are read and never written, so every iteration can share them.
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
