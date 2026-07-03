import {
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { pruneStaleSnapshots } from "@/services/exec/snapshot/pruneStaleSnapshots";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Canonical hash-shaped dir names: the live entry the current lockfile resolves to, and a superseded one beside it.
const CURRENT_HASH = "0";
const STALE_HASH = "1";

describe(pruneStaleSnapshots, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A pid far above any real one, so its lease reads as a dead owner's corpse; process.pid is the live runner.
  const DEAD_PID = 2 ** 30;
  let cacheHome = "";
  const snapshotsDir = (): string => join(cacheHome, VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
  const seedSnapshot = (hash: string): string => {
    const dir = join(snapshotsDir(), hash);
    mkdirSync(dir, { recursive: true });
    return dir;
  };
  const seedLease = (hash: string, pid: number): void => {
    const leasesDir = join(seedSnapshot(hash), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);
    mkdirSync(leasesDir, { recursive: true });
    writeFileSync(join(leasesDir, String(pid)), "");
  };

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("removes every superseded snapshot while keeping the current one", () => {
    expect.hasAssertions();

    const current = seedSnapshot(CURRENT_HASH);
    const stale = seedSnapshot(STALE_HASH);

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(false);
  });

  test("is a no-op when the snapshots directory does not exist yet", () => {
    expect.hasAssertions();

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(snapshotsDir())).toBe(false);
  });

  test("keeps a superseded snapshot a live run still leases", () => {
    expect.hasAssertions();

    const current = seedSnapshot(CURRENT_HASH);
    const stale = seedSnapshot(STALE_HASH);
    seedLease(STALE_HASH, process.pid);

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(true);
  });

  test("removes a superseded snapshot whose leases are all dead", () => {
    expect.hasAssertions();

    const stale = seedSnapshot(STALE_HASH);
    seedLease(STALE_HASH, DEAD_PID);

    pruneStaleSnapshots(CURRENT_HASH);

    expect(existsSync(stale)).toBe(false);
  });
});
