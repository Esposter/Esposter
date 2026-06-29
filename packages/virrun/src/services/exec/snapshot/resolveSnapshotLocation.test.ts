import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(resolveSnapshotLocation, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("addresses the snapshot in the global cache under snapshots/<lockfile-hash> with its upper dir", () => {
    expect.hasAssertions();

    const dir = createWorkspace();
    const { dir: snapshotDir, hash, upperDir } = resolveSnapshotLocation(dir);
    const expectedDir = join(cacheHome, VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);

    expect(hash).toBe(computeLockfileHash(dir));
    expect(snapshotDir).toBe(expectedDir);
    expect(upperDir).toBe(join(expectedDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME));
  });

  test("lives outside the repo so a forked overlay lower never nests inside the source tree", () => {
    expect.hasAssertions();

    const dir = createWorkspace();

    expect(resolveSnapshotLocation(dir).dir.startsWith(dir)).toBe(false);
  });

  test("reports exists only once the upper layer has been captured on disk", () => {
    expect.hasAssertions();

    const dir = createWorkspace();

    expect(resolveSnapshotLocation(dir).exists).toBe(false);

    mkdirSync(resolveSnapshotLocation(dir).upperDir, { recursive: true });

    expect(resolveSnapshotLocation(dir).exists).toBe(true);
  });
});
