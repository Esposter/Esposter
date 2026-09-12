import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedFile } from "#src/services/exec/test/seedFile.test";
import { REMOVE_LIST_REAP_MINIMUM_AGE_MS } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "#src/services/exec/wsl/constants";
import { reapStaleRemoveLists } from "#src/services/exec/wsl/reapStaleRemoveLists";
import { existsSync, utimesSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleRemoveLists, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";
  const seed = (name: string): string => seedFile(join(directory, name));

  beforeEach(() => {
    directory = create();
  });

  afterEach(cleanup);

  // The owner exiting says nothing about whether its teardown has opened the list: the spawn is asynchronous and
  // Wsl.exe still has to start the relay and `sh` behind it, so a fresh list is left alone however dead its owner is
  test("reaps a dead owner's list only once it is older than the age floor", () => {
    expect.hasAssertions();

    const freshList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const agedList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}${TEST_FILENAME}`);
    const stagedAt = new Date(Date.now() - REMOVE_LIST_REAP_MINIMUM_AGE_MS * 2);
    utimesSync(agedList, stagedAt, stagedAt);

    reapStaleRemoveLists(directory);

    expect(existsSync(freshList)).toBe(true);
    expect(existsSync(agedList)).toBe(false);
  });
});
