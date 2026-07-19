import {
  TASK_CACHE_MAX_AGE_DAYS,
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_TEMP_PREFIX,
} from "@/services/exec/cache/constants";
import { pruneStaleTaskCacheEntries } from "@/services/exec/cache/pruneStaleTaskCacheEntries";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { existsSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// One day past the cutoff — an entry last touched this long ago is dead weight and swept.
const STALE_AGE_DAYS = TASK_CACHE_MAX_AGE_DAYS + 1;
const SECONDS_PER_DAY = 24 * 60 * 60;

describe(pruneStaleTaskCacheEntries, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let tasksRoot = "";
  // Seed a published `tasks/<key>` entry with a meta file, aged `ageDays` days back by stamping the meta mtime.
  const seedEntry = (name: string, ageDays: number): string => {
    const dir = seedDirectory(join(tasksRoot, name));
    const metaFile = join(dir, TASK_CACHE_META_FILENAME);
    writeFileSync(metaFile, "");
    const touchedAt = new Date(Date.now() - ageDays * SECONDS_PER_DAY * 1000);
    utimesSync(metaFile, touchedAt, touchedAt);
    return dir;
  };

  beforeEach(() => {
    tasksRoot = create();
  });

  afterEach(cleanup);

  test("removes an entry not touched within the max age while keeping a recent one", () => {
    expect.hasAssertions();

    const stale = seedEntry("stale", STALE_AGE_DAYS);
    const recent = seedEntry("recent", 0);

    pruneStaleTaskCacheEntries(tasksRoot);

    expect(existsSync(stale)).toBe(false);
    expect(existsSync(recent)).toBe(true);
  });

  test("never touches a pid-tagged temp even when it is old", () => {
    expect.hasAssertions();

    const temp = seedEntry(`${TASK_CACHE_TEMP_PREFIX}123.abc`, STALE_AGE_DAYS);

    pruneStaleTaskCacheEntries(tasksRoot);

    expect(existsSync(temp)).toBe(true);
  });

  test("keeps an entry whose meta file is missing rather than evicting on a blind guess", () => {
    expect.hasAssertions();

    const noMeta = seedDirectory(join(tasksRoot, "no-meta"));

    pruneStaleTaskCacheEntries(tasksRoot);

    expect(existsSync(noMeta)).toBe(true);
  });
});
