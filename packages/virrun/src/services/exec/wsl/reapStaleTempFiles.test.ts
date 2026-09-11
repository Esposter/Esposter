import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedFile } from "#src/services/exec/test/seedFile.test";
import { REMOVE_LIST_REAP_MINIMUM_AGE_MS } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { reapStaleTempFiles } from "#src/services/exec/wsl/reapStaleTempFiles";
import { existsSync, mkdirSync, utimesSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleTempFiles, () => {
  const TEMP_PREFIX = `${TEST_FILENAME}.`;

  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";
  const seed = (name: string): string => seedFile(join(directory, name));

  beforeEach(() => {
    directory = create();
  });

  afterEach(cleanup);

  test("reclaims a dead owner's temp while keeping a live owner's, untagged files and directories", () => {
    expect.hasAssertions();

    const deadTemp = seed(`${TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const liveTemp = seed(`${TEMP_PREFIX}${process.pid}.${TEST_FILENAME}`);
    const untaggedFile = seed(TEST_FILENAME);
    const deadDirectory = join(directory, `${TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}.d`);
    mkdirSync(deadDirectory);

    reapStaleTempFiles(directory, [TEMP_PREFIX]);

    expect(existsSync(deadTemp)).toBe(false);
    expect(existsSync(liveTemp)).toBe(true);
    expect(existsSync(untaggedFile)).toBe(true);
    expect(existsSync(deadDirectory)).toBe(true);
  });

  // A caller whose reader opens the temp asynchronously after the owner is gone asks for the floor: a temp younger
  // Than it is left however dead its owner is, and one past it goes
  test("keeps a dead owner's temp younger than the age floor and reaps one past it", () => {
    expect.hasAssertions();

    const freshTemp = seed(`${TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const agedTemp = seed(`${TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}${TEST_FILENAME}`);
    const stagedAt = new Date(Date.now() - REMOVE_LIST_REAP_MINIMUM_AGE_MS * 2);
    utimesSync(agedTemp, stagedAt, stagedAt);

    reapStaleTempFiles(directory, [TEMP_PREFIX], REMOVE_LIST_REAP_MINIMUM_AGE_MS);

    expect(existsSync(freshTemp)).toBe(true);
    expect(existsSync(agedTemp)).toBe(false);
  });

  test("is a no-op on a directory that does not exist yet", () => {
    expect.hasAssertions();

    expect(() => {
      reapStaleTempFiles(join(directory, TEST_FILENAME), [TEMP_PREFIX]);
    }).not.toThrow();
  });
});
