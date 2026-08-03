import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { SOURCE_MIRROR_UNMARKED_MAX_AGE_MS } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import {
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
  VIRRUN_SOURCES_DIRECTORY_NAME,
} from "@/services/exec/wsl/constants";
import { reapAbandonedSourceMirrors } from "@/services/exec/wsl/reapAbandonedSourceMirrors";
import { existsSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// GetWslNativeCacheRoot resolves the ext4 cache root the mirrors live under; point it at a per-test temp dir (a plain
// Local path, so removeSnapshotDirectoriesDetached teardown stays synchronous and deterministic — no WSL round-trip).
const { cacheRootHolder } = vi.hoisted(() => ({ cacheRootHolder: { value: "" } }));

vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => cacheRootHolder.value,
}));

const ageOut = (entry: string): void => {
  const agedDate = new Date(Date.now() - SOURCE_MIRROR_UNMARKED_MAX_AGE_MS - 1);
  utimesSync(entry, agedDate, agedDate);
};

describe(reapAbandonedSourceMirrors, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // The entry key of the run doing the sweeping; every case here seeds some other repo's entry under "0".
  const liveEntryName = "1";
  const sourcesDirectory = (): string => join(cacheRootHolder.value, VIRRUN_SOURCES_DIRECTORY_NAME);
  // Seed a mirror entry (`sources/<hash>/tree` + an optional `origin` marker) and return its entry dir.
  const seedMirror = (hash: string, origin?: string): string => {
    const entry = join(sourcesDirectory(), hash);
    seedDirectory(join(entry, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME));
    if (origin !== undefined) writeFileSync(join(entry, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME), origin);
    return entry;
  };

  beforeEach(() => {
    cacheRootHolder.value = create();
  });

  afterEach(() => {
    cacheRootHolder.value = "";
    cleanup();
  });

  test("reaps a mirror whose origin host dir no longer exists", () => {
    expect.hasAssertions();

    const abandonedMirror = seedMirror("0", join(cacheRootHolder.value, TEST_FILENAME));

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(abandonedMirror)).toBe(false);
  });

  test("keeps a mirror whose origin host dir still exists", () => {
    expect.hasAssertions();

    const liveMirror = seedMirror("0", create());

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(liveMirror)).toBe(true);
  });

  test("keeps a freshly created mirror with no origin marker, which a live planner is mid-writing", () => {
    expect.hasAssertions();

    const unmarkedMirror = seedMirror("0");

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(unmarkedMirror)).toBe(true);
  });

  // The marker is written the instant the entry dir exists, so an aged unmarked entry is a corpse of a sync that
  // Died in that instant — the case that leaked forever while "unmarked" alone meant untouchable
  test("reaps an unmarked mirror once it is older than the grace window", () => {
    expect.hasAssertions();

    const abandonedMirror = seedMirror("0");
    ageOut(abandonedMirror);

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(abandonedMirror)).toBe(false);
  });

  // A marker that exists settles the entry whatever it says, so the age fallback never sees it. Aged deliberately:
  // Collapsing an unreadable or blank marker into the no-marker case is what deletes a live run's mirror.
  test("keeps a mirror whose origin marker is blank however old the entry is", () => {
    expect.hasAssertions();

    const midWrite = seedMirror("0", "  ");
    ageOut(midWrite);

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(midWrite)).toBe(true);
  });

  // Crossing the sweep with the run that triggers it: the marker is best-effort (its rename is swallowed when a
  // Concurrent reader holds the destination open), so an aged unmarked entry can belong to the live run itself —
  // Whose tree bwrap is about to mount as its overlay lower. No evidence may condemn this run's own entry.
  test("keeps this run's own mirror even when it is unmarked and aged out", () => {
    expect.hasAssertions();

    const liveMirror = seedMirror(liveEntryName);
    ageOut(liveMirror);

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(liveMirror)).toBe(true);
  });

  test("is a no-op when the sources directory does not exist yet", () => {
    expect.hasAssertions();

    reapAbandonedSourceMirrors(liveEntryName);

    expect(existsSync(sourcesDirectory())).toBe(false);
  });
});
