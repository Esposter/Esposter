import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// The shared predicate under test: everything whose name starts with the stale marker is swept, the rest kept.
const isStale = (name: string): boolean => name.startsWith(" ");
const { removeSnapshotDirectoriesDetached } = vi.hoisted(() => ({
  removeSnapshotDirectoriesDetached: vi.fn<(dirs: readonly string[]) => void>(),
}));
// Spied, not stubbed: the teardown still really runs (the removal assertions below are the point), while the batching
// Test can see that a sweep of N entries reaches it as ONE call — the property that keeps a sweep to one wsl.exe.
vi.mock(import("@/services/exec/snapshot/removeSnapshotDirectoriesDetached"), async (importOriginal) => {
  const original = await importOriginal();
  removeSnapshotDirectoriesDetached.mockImplementation(original.removeSnapshotDirectoriesDetached);
  return { removeSnapshotDirectoriesDetached };
});

describe(sweepStaleEntries, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";
  const seedEntry = (name: string): string => seedDirectory(join(directory, name));

  beforeEach(() => {
    vi.clearAllMocks();
    directory = create();
  });

  afterEach(cleanup);

  test("removes every directory the predicate selects, keeping the rest", () => {
    expect.hasAssertions();

    const staleEntry = seedEntry(" ");
    const liveEntry = seedEntry(TEST_FILENAME);

    sweepStaleEntries(directory, isStale);

    expect(existsSync(staleEntry)).toBe(false);
    expect(existsSync(liveEntry)).toBe(true);
  });

  test("skips files even when the predicate selects them, so a stray file is never removed", () => {
    expect.hasAssertions();

    const file = join(directory, " ");
    writeFileSync(file, "");

    sweepStaleEntries(directory, isStale);

    expect(existsSync(file)).toBe(true);
  });

  test("hands every selected entry to one teardown call, never one call per entry", () => {
    expect.hasAssertions();

    const staleEntries = [" ", "  "].map((name) => seedEntry(name));

    sweepStaleEntries(directory, isStale);

    expect(removeSnapshotDirectoriesDetached).toHaveBeenCalledExactlyOnceWith(staleEntries);
  });

  test("is a no-op when the directory does not exist", () => {
    expect.hasAssertions();

    const absentDirectory = join(directory, "absent");

    sweepStaleEntries(absentDirectory, isStale);

    expect(existsSync(absentDirectory)).toBe(false);
  });
});
