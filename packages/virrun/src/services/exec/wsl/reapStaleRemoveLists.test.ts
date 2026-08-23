import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { REMOVE_LIST_REAP_MINIMUM_AGE_MS } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "#src/services/exec/wsl/constants";
import { reapStaleRemoveLists } from "#src/services/exec/wsl/reapStaleRemoveLists";
import { existsSync, mkdirSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleRemoveLists, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";
  // Every list a reap can legitimately see was staged by an earlier run, so seeding back-dates past the age gate;
  // The one test that needs a just-staged list writes it itself
  const seed = (name: string): string => {
    const path = join(directory, name);
    writeFileSync(path, "");
    const stagedAt = new Date(Date.now() - REMOVE_LIST_REAP_MINIMUM_AGE_MS * 2);
    utimesSync(path, stagedAt, stagedAt);
    return path;
  };

  beforeEach(() => {
    directory = create();
  });

  afterEach(cleanup);

  test("reclaims a dead owner's list while keeping a live owner's, other files and directories", () => {
    expect.hasAssertions();

    const deadList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const liveList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${process.pid}.${TEST_FILENAME}`);
    const unrelatedFile = seed(TEST_FILENAME);
    const cacheDirectory = join(directory, `${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}.d`);
    mkdirSync(cacheDirectory);

    reapStaleRemoveLists(directory);

    expect(existsSync(deadList)).toBe(false);
    expect(existsSync(liveList)).toBe(true);
    expect(existsSync(unrelatedFile)).toBe(true);
    expect(existsSync(cacheDirectory)).toBe(true);
  });

  // The owner exiting says nothing about whether its teardown has opened the list: the spawn is asynchronous and
  // Wsl.exe still has to start the relay and `sh` behind it, so a fresh list is left alone however dead its owner is
  test("keeps a freshly staged list whose owner is already dead", () => {
    expect.hasAssertions();

    const deadList = join(directory, `${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    writeFileSync(deadList, "");

    reapStaleRemoveLists(directory);

    expect(existsSync(deadList)).toBe(true);
  });
});
