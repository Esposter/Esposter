import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { pruneStaleSnapshots } from "@/services/exec/snapshot/pruneStaleSnapshots";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Canonical hash-shaped dir names: the live entry the current lockfile resolves to, and a superseded one beside it.
const CURRENT_HASH = "0";
const STALE_HASH = "1";

describe(pruneStaleSnapshots, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cacheHome = "";
  const snapshotsDir = (): string => join(cacheHome, VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
  const seedSnapshot = (hash: string): string => {
    const dir = join(snapshotsDir(), hash);
    mkdirSync(dir, { recursive: true });
    return dir;
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
});
