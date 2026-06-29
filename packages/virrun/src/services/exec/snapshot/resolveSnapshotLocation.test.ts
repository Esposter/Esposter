import { createTemporaryDirectory as baseTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { createWorkspaceDir as baseWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  VIRRUN_CACHE_HOME_KEY,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];
let cacheHome = "";
// Track every fixture dir for teardown; the shared helpers create them, this file owns their cleanup.
const track = (dir: string): string => {
  temporaryDirectories.push(dir);
  return dir;
};
const createTemporaryDirectory = (): string => track(baseTemporaryDirectory());
const createRepo = (): string => track(baseWorkspaceDir());

describe(resolveSnapshotLocation, () => {
  beforeEach(() => {
    cacheHome = createTemporaryDirectory();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    while (temporaryDirectories.length > 0) {
      const dir = temporaryDirectories.pop();
      if (dir !== undefined) rmSync(dir, { force: true, recursive: true });
    }
  });

  test("addresses the snapshot in the global cache under snapshots/<lockfile-hash> with its upper dir", () => {
    expect.hasAssertions();

    const dir = createRepo();
    const { dir: snapshotDir, hash, upperDir } = resolveSnapshotLocation(dir);
    const expectedDir = join(cacheHome, VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);

    expect(hash).toBe(computeLockfileHash(dir));
    expect(snapshotDir).toBe(expectedDir);
    expect(upperDir).toBe(join(expectedDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME));
  });

  test("lives outside the repo so a forked overlay lower never nests inside the source tree", () => {
    expect.hasAssertions();

    const dir = createRepo();

    expect(resolveSnapshotLocation(dir).dir.startsWith(dir)).toBe(false);
  });

  test("reports exists only once the upper layer has been captured on disk", () => {
    expect.hasAssertions();

    const dir = createRepo();

    expect(resolveSnapshotLocation(dir).exists).toBe(false);

    mkdirSync(resolveSnapshotLocation(dir).upperDir, { recursive: true });

    expect(resolveSnapshotLocation(dir).exists).toBe(true);
  });
});
