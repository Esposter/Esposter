import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// The shared predicate under test: everything whose name starts with the stale marker is swept, the rest kept.
const isStale = (name: string): boolean => name.startsWith(" ");

describe(sweepStaleEntries, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let dir = "";
  const seedEntry = (name: string): string => seedDirectory(join(dir, name));

  beforeEach(() => {
    dir = create();
  });

  afterEach(cleanup);

  test("removes every directory the predicate selects, keeping the rest", () => {
    expect.hasAssertions();

    const stale = seedEntry(" ");
    const live = seedEntry(TEST_FILENAME);

    sweepStaleEntries(dir, isStale);

    expect(existsSync(stale)).toBe(false);
    expect(existsSync(live)).toBe(true);
  });

  test("skips files even when the predicate selects them, so a stray file is never removed", () => {
    expect.hasAssertions();

    const file = join(dir, " ");
    writeFileSync(file, "");

    sweepStaleEntries(dir, isStale);

    expect(existsSync(file)).toBe(true);
  });

  test("is a no-op when the directory does not exist", () => {
    expect.hasAssertions();

    const absent = join(dir, "absent");

    sweepStaleEntries(absent, isStale);

    expect(existsSync(absent)).toBe(false);
  });
});
