import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { pruneStaleSnapshots } from "@/services/exec/snapshot/pruneStaleSnapshots";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The generic keep/lease/absent matrix lives in pruneSupersededEntries; here only the wiring — superseded siblings
// Under the global `snapshots/` dir are evicted while the current hash's dir survives.
describe(pruneStaleSnapshots, () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  // Canonical hash-shaped dir names: the live entry the current lockfile resolves to, and a superseded one beside it.
  const CURRENT_HASH = "0";
  const STALE_HASH = "1";

  test("removes a superseded snapshot in the global cache while keeping the current one", () => {
    expect.hasAssertions();

    const snapshotsDir = join(getCacheHome(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
    const current = seedDirectory(join(snapshotsDir, CURRENT_HASH));
    const stale = seedDirectory(join(snapshotsDir, STALE_HASH));

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(false);
  });
});
