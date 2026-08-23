import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { pruneSupersededEntries } from "#src/services/exec/snapshot/pruneSupersededEntries";
import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "#src/services/exec/test/seedDirectory.test";
import { writeLeaseFile } from "#src/services/exec/test/writeLeaseFile.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(pruneSupersededEntries, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // Canonical entry names: the one the current run resolves to, and a superseded sibling beside it.
  const CURRENT_NAME = "0";
  const STALE_NAME = "1";
  let directory = "";
  const seedEntry = (name: string): string => seedDirectory(join(directory, name));
  const seedLease = (name: string, pid: number): string =>
    writeLeaseFile(join(seedEntry(name), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME), pid);

  beforeEach(() => {
    // A not-yet-created child of the tracked temp dir, so the absent-directory case is exercisable.
    directory = join(create(), TEST_FILENAME);
  });

  afterEach(cleanup);

  test("removes every superseded entry while keeping the current one", () => {
    expect.hasAssertions();

    const entry = seedEntry(CURRENT_NAME);
    const staleEntry = seedEntry(STALE_NAME);

    pruneSupersededEntries(directory, CURRENT_NAME);

    expect(existsSync(entry)).toBe(true);
    expect(existsSync(staleEntry)).toBe(false);
  });

  test("is a no-op when the directory does not exist yet", () => {
    expect.hasAssertions();

    pruneSupersededEntries(directory, CURRENT_NAME);

    expect(existsSync(directory)).toBe(false);
  });

  test("keeps a superseded entry a live run still leases", () => {
    expect.hasAssertions();

    const entry = seedEntry(CURRENT_NAME);
    const staleEntry = seedEntry(STALE_NAME);
    seedLease(STALE_NAME, process.pid);

    pruneSupersededEntries(directory, CURRENT_NAME);

    expect(existsSync(entry)).toBe(true);
    expect(existsSync(staleEntry)).toBe(true);
  });

  test("removes a superseded entry whose leases are all dead", () => {
    expect.hasAssertions();

    const staleEntry = seedEntry(STALE_NAME);
    seedLease(STALE_NAME, DEAD_PID);

    pruneSupersededEntries(directory, CURRENT_NAME);

    expect(existsSync(staleEntry)).toBe(false);
  });
});
