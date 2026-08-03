import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { isExcludedPath } from "@/services/exec/util/isExcludedPath";
import { describe, expect, test } from "vitest";

// Any nested slashed pattern — a linked worktree root, a prepare output dir — matches the same way.
const NESTED_PATH = "b/c";

describe(isExcludedPath, () => {
  test("matches a bare name at the root, at depth, and everything inside it", () => {
    expect.hasAssertions();

    expect(isExcludedPath(NODE_MODULES_DIRECTORY, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(isExcludedPath(`${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(isExcludedPath(`${TEST_FILENAME}/${NODE_MODULES_DIRECTORY}`, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(
      isExcludedPath(`${TEST_FILENAME}/${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`, [NODE_MODULES_DIRECTORY]),
    ).toBe(true);
  });

  test("matches a slashed pattern from the tree root only, and its whole subtree", () => {
    expect.hasAssertions();

    expect(isExcludedPath(NESTED_PATH, [NESTED_PATH])).toBe(true);
    expect(isExcludedPath(`${NESTED_PATH}/${TEST_FILENAME}`, [NESTED_PATH])).toBe(true);
    // The same tail nested deeper is a different path — a slashed pattern is anchored, never floating.
    expect(isExcludedPath(`${TEST_FILENAME}/${NESTED_PATH}`, [NESTED_PATH])).toBe(false);
  });

  test("never matches a sibling that merely shares the pattern's prefix", () => {
    expect.hasAssertions();

    // The bug a plain startsWith would ship: `.gitignore` is source and must stay flushable while `.git` is excluded.
    expect(isExcludedPath(`${GIT_DIRECTORY}ignore`, [GIT_DIRECTORY])).toBe(false);
    expect(isExcludedPath(`${TEST_FILENAME}/${GIT_DIRECTORY}ignore`, [GIT_DIRECTORY])).toBe(false);
    expect(isExcludedPath(`${NESTED_PATH}${TEST_FILENAME}`, [NESTED_PATH])).toBe(false);
  });

  test("does not match a path no pattern covers", () => {
    expect.hasAssertions();

    expect(isExcludedPath(`${TEST_FILENAME}/${TEST_FILENAME}`, [GIT_DIRECTORY, NESTED_PATH])).toBe(false);
    expect(isExcludedPath(TEST_FILENAME, [])).toBe(false);
  });
});
