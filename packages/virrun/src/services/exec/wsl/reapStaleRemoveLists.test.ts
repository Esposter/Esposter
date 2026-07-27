import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "@/services/exec/wsl/constants";
import { reapStaleRemoveLists } from "@/services/exec/wsl/reapStaleRemoveLists";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleRemoveLists, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let dir = "";
  const seed = (name: string): string => {
    const path = join(dir, name);
    writeFileSync(path, "");
    return path;
  };

  beforeEach(() => {
    dir = create();
  });

  afterEach(cleanup);

  test("reclaims a dead owner's list while keeping a live owner's, other files and directories", () => {
    expect.hasAssertions();

    const deadList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const liveList = seed(`${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${process.pid}.${TEST_FILENAME}`);
    const unrelatedFile = seed(TEST_FILENAME);
    const cacheDirectory = join(dir, `${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}.d`);
    mkdirSync(cacheDirectory);

    reapStaleRemoveLists(dir);

    expect(existsSync(deadList)).toBe(false);
    expect(existsSync(liveList)).toBe(true);
    expect(existsSync(unrelatedFile)).toBe(true);
    expect(existsSync(cacheDirectory)).toBe(true);
  });
});
