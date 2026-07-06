import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { pruneSupersededEntries } from "@/services/exec/snapshot/pruneSupersededEntries";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { writeLeaseFile } from "@/services/exec/test/writeLeaseFile.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(pruneSupersededEntries, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // Canonical entry names: the one the current run resolves to, and a superseded sibling beside it.
  const CURRENT_NAME = "0";
  const STALE_NAME = "1";
  let dir = "";
  const seedEntry = (name: string): string => seedDirectory(join(dir, name));
  const seedLease = (name: string, pid: number): string =>
    writeLeaseFile(join(seedEntry(name), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME), pid);

  beforeEach(() => {
    // A not-yet-created child of the tracked temp dir, so the absent-directory case is exercisable.
    dir = join(create(), TEST_FILENAME);
  });

  afterEach(cleanup);

  test("removes every superseded entry while keeping the current one", () => {
    expect.hasAssertions();

    const current = seedEntry(CURRENT_NAME);
    const stale = seedEntry(STALE_NAME);

    pruneSupersededEntries(dir, CURRENT_NAME);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(false);
  });

  test("is a no-op when the directory does not exist yet", () => {
    expect.hasAssertions();

    pruneSupersededEntries(dir, CURRENT_NAME);

    expect(existsSync(dir)).toBe(false);
  });

  test("keeps a superseded entry a live run still leases", () => {
    expect.hasAssertions();

    const current = seedEntry(CURRENT_NAME);
    const stale = seedEntry(STALE_NAME);
    seedLease(STALE_NAME, process.pid);

    pruneSupersededEntries(dir, CURRENT_NAME);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(true);
  });

  test("removes a superseded entry whose leases are all dead", () => {
    expect.hasAssertions();

    const stale = seedEntry(STALE_NAME);
    seedLease(STALE_NAME, DEAD_PID);

    pruneSupersededEntries(dir, CURRENT_NAME);

    expect(existsSync(stale)).toBe(false);
  });
});
