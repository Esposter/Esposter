import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { pruneStalePrepareLayers } from "@/services/exec/snapshot/pruneStalePrepareLayers";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The generic keep/lease/absent matrix lives in pruneSupersededEntries; here only the wiring — superseded siblings
// Under the global `prepare/` dir are evicted while the current key's layer survives.
describe(pruneStalePrepareLayers, () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  // Canonical source-key-shaped dir names: the layer the current source state resolves to, and a superseded one.
  const CURRENT_KEY = "0";
  const STALE_KEY = "1";

  test("removes a superseded prepare layer in the global cache while keeping the current one", () => {
    expect.hasAssertions();

    const prepareDirectory = join(getCacheHome(), VIRRUN_PREPARE_DIRECTORY_NAME);
    const layer = seedDirectory(join(prepareDirectory, CURRENT_KEY));
    const staleLayer = seedDirectory(join(prepareDirectory, STALE_KEY));

    pruneStalePrepareLayers(CURRENT_KEY);

    expect(existsSync(layer)).toBe(true);
    expect(existsSync(staleLayer)).toBe(false);
  });
});
