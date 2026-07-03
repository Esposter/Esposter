import {
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { reapStaleTemps } from "@/services/exec/snapshot/reapStaleTemps";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleTemps, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A pid far above any real one, so the reap sees its owner as dead (ESRCH).
  const DEAD_PID = 2 ** 30;
  // Stands in for the tail mkdtempSync appends after the pid-tagged prefix; irrelevant to the reap.
  const MKDTEMP_SUFFIX = "test";
  let dir = "";
  const seed = (name: string): string => {
    const entry = join(dir, name);
    mkdirSync(entry, { recursive: true });
    return entry;
  };

  beforeEach(() => {
    dir = create();
  });

  afterEach(cleanup);

  test(`reaps a hard-killed run's temps while keeping a live run's temps and the published entries`, () => {
    expect.hasAssertions();

    const deadCaptureUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${DEAD_PID}.${MKDTEMP_SUFFIX}`);
    const deadCaptureWork = seed(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.${DEAD_PID}.${MKDTEMP_SUFFIX}`);
    const deadPersistUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${DEAD_PID}.${MKDTEMP_SUFFIX}`);
    const deadPersistWork = seed(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.${DEAD_PID}.${MKDTEMP_SUFFIX}`);
    const liveCaptureUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${process.pid}.${MKDTEMP_SUFFIX}`);
    const livePersistUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${process.pid}.${MKDTEMP_SUFFIX}`);
    const publishedUpper = seed(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
    const publishedWork = seed(VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME);
    const leases = seed(VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);

    reapStaleTemps(dir, VIRRUN_SNAPSHOT_TEMP_PREFIXES);

    expect(existsSync(deadCaptureUpper)).toBe(false);
    expect(existsSync(deadCaptureWork)).toBe(false);
    expect(existsSync(deadPersistUpper)).toBe(false);
    expect(existsSync(deadPersistWork)).toBe(false);
    expect(existsSync(liveCaptureUpper)).toBe(true);
    expect(existsSync(livePersistUpper)).toBe(true);
    expect(existsSync(publishedUpper)).toBe(true);
    expect(existsSync(publishedWork)).toBe(true);
    expect(existsSync(leases)).toBe(true);
  });

  test(`keeps a legacy random-only temp it can't attribute to a dead owner`, () => {
    expect.hasAssertions();

    const legacyTemp = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${MKDTEMP_SUFFIX}`);

    reapStaleTemps(dir, VIRRUN_SNAPSHOT_TEMP_PREFIXES);

    expect(existsSync(legacyTemp)).toBe(true);
  });
});
