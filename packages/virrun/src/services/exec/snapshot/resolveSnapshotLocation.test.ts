import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  PNPM_LOCKFILE_FILENAME,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
  VIRRUN_TEMP_DIR_PREFIX,
} from "@/services/exec/util/constants";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const lockfileContent = "lockfileVersion: '9.0'\n";
const temporaryDirectories: string[] = [];

const createRepo = (): string => {
  const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  temporaryDirectories.push(dir);
  writeFileSync(join(dir, PNPM_LOCKFILE_FILENAME), lockfileContent);
  return dir;
};

describe(resolveSnapshotLocation, () => {
  afterEach(() => {
    while (temporaryDirectories.length > 0) {
      const dir = temporaryDirectories.pop();
      if (dir !== undefined) rmSync(dir, { force: true, recursive: true });
    }
  });

  test("addresses the snapshot under .virrun/snapshots/<lockfile-hash> with its overlay dirs", () => {
    expect.hasAssertions();

    const dir = createRepo();
    const { dir: snapshotDir, hash, upperDir, workDir } = resolveSnapshotLocation(dir);
    const expectedDir = join(dir, VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);

    expect(hash).toBe(computeLockfileHash(dir));
    expect(snapshotDir).toBe(expectedDir);
    expect(upperDir).toBe(join(expectedDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME));
    expect(workDir).toBe(join(expectedDir, VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME));
  });

  test("reports exists only once the upper layer has been captured on disk", () => {
    expect.hasAssertions();

    const dir = createRepo();

    expect(resolveSnapshotLocation(dir).exists).toBe(false);

    mkdirSync(resolveSnapshotLocation(dir).upperDir, { recursive: true });

    expect(resolveSnapshotLocation(dir).exists).toBe(true);
  });
});
