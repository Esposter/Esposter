import {
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { reapStaleTemps } from "@/services/exec/snapshot/reapStaleTemps";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedDirectory } from "@/services/exec/test/seedDirectory.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleTemps, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";
  const seed = (name: string): string => seedDirectory(join(directory, name));

  beforeEach(() => {
    directory = create();
  });

  afterEach(cleanup);

  test(`reaps a hard-killed run's temps while keeping a live run's temps and the published entries`, () => {
    expect.hasAssertions();

    const deadCaptureUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${DEAD_PID}.${TEST_FILENAME}`);
    const deadCaptureWork = seed(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.${DEAD_PID}.${TEST_FILENAME}`);
    const deadPersistUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${DEAD_PID}.${TEST_FILENAME}`);
    const deadPersistWork = seed(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.${DEAD_PID}.${TEST_FILENAME}`);
    const liveCaptureUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${process.pid}.${TEST_FILENAME}`);
    const livePersistUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${process.pid}.${TEST_FILENAME}`);
    const publishedUpper = seed(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
    const publishedWork = seed(VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME);
    const leases = seed(VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);

    reapStaleTemps(directory, VIRRUN_SNAPSHOT_TEMP_PREFIXES);

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

    const legacyTemp = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${TEST_FILENAME}`);

    reapStaleTemps(directory, VIRRUN_SNAPSHOT_TEMP_PREFIXES);

    expect(existsSync(legacyTemp)).toBe(true);
  });
});
