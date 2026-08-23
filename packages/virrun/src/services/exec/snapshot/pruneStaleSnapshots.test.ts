import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { pruneStaleSnapshots } from "#src/services/exec/snapshot/pruneStaleSnapshots";
import { seedDirectory } from "#src/services/exec/test/seedDirectory.test";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
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

    const snapshotsDirectory = join(getCacheHome(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
    const snapshot = seedDirectory(join(snapshotsDirectory, CURRENT_HASH));
    const staleSnapshot = seedDirectory(join(snapshotsDirectory, STALE_HASH));

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(snapshot)).toBe(true);
    expect(existsSync(staleSnapshot)).toBe(false);
  });
});
