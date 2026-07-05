import { TASK_CACHE_TEMP_PREFIX, VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { recordTaskCache } from "@/services/exec/cache/recordTaskCache";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
// Record just orchestrates the temp reap + atomic publish; the real Linux flush is exercised in taskCache.equivalence,
// So stub applyFlushPlan to keep this host-agnostic.
vi.mock(import("@/services/exec/snapshot/applyFlushPlan"), () => ({ applyFlushPlan: vi.fn<typeof applyFlushPlan>() }));

describe(recordTaskCache, () => {
  const { create, getCacheHome } = setupTemporaryCacheHome();
  // Content-hash-shaped key the entry publishes under.
  const KEY = "0";
  const seedTemp = (pid: number): string =>
    seedDirectory(
      join(getCacheHome(), VIRRUN_TASKS_DIRECTORY_NAME, `${TASK_CACHE_TEMP_PREFIX}${pid}.${TEST_FILENAME}`),
    );

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
