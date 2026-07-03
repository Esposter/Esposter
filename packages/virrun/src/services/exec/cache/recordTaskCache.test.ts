import { TASK_CACHE_TEMP_PREFIX, VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { recordTaskCache } from "@/services/exec/cache/recordTaskCache";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// Record just orchestrates the temp reap + atomic publish; the real Linux flush is exercised in taskCache.equivalence,
// So stub applyFlushPlan to keep this host-agnostic.
vi.mock(import("@/services/exec/snapshot/applyFlushPlan"), () => ({ applyFlushPlan: vi.fn<typeof applyFlushPlan>() }));

describe(recordTaskCache, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // Content-hash-shaped key the entry publishes under.
  const KEY = "0";
  let cacheHome = "";
  const tasksRoot = (): string => join(cacheHome, VIRRUN_TASKS_DIRECTORY_NAME);
  const seedTemp = (pid: number): string => {
    const dir = join(tasksRoot(), `${TASK_CACHE_TEMP_PREFIX}${pid}.${TEST_FILENAME}`);
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

  test("reaps a hard-killed recorder's temp, keeps a live one, and publishes the entry", () => {
    expect.hasAssertions();

    const deadTemp = seedTemp(DEAD_PID);
    const liveTemp = seedTemp(process.pid);

    recordTaskCache(KEY, create(), [], { exitCode: 0, stderr: "", stdout: "" });

    expect(existsSync(deadTemp)).toBe(false);
    expect(existsSync(liveTemp)).toBe(true);
    expect(resolveTaskCacheLocation(KEY).exists).toBe(true);
  });
});
