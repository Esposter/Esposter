import { checkIsExcludedPath } from "#src/services/exec/util/checkIsExcludedPath";
import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { toRootAnchoredExclude } from "#src/services/exec/util/toRootAnchoredExclude";
import { describe, expect, test } from "vitest";

describe(checkIsExcludedPath, () => {
  // Any nested slashed pattern — a linked worktree root, a prepare output dir — matches the same way.
  const NESTED_PATH = "b/c";

  test("matches a bare name at the root, at depth, and everything inside it", () => {
    expect.hasAssertions();

    expect(checkIsExcludedPath(NODE_MODULES_DIRECTORY, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(checkIsExcludedPath(`${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(checkIsExcludedPath(`${TEST_FILENAME}/${NODE_MODULES_DIRECTORY}`, [NODE_MODULES_DIRECTORY])).toBe(true);
    expect(
      checkIsExcludedPath(`${TEST_FILENAME}/${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`, [NODE_MODULES_DIRECTORY]),
    ).toBe(true);
  });

  test("matches a slashed pattern from the tree root only, and its whole subtree", () => {
    expect.hasAssertions();

    expect(checkIsExcludedPath(NESTED_PATH, [NESTED_PATH])).toBe(true);
    expect(checkIsExcludedPath(`${NESTED_PATH}/${TEST_FILENAME}`, [NESTED_PATH])).toBe(true);
    // The same tail nested deeper is a different path — a slashed pattern is anchored, never floating.
    expect(checkIsExcludedPath(`${TEST_FILENAME}/${NESTED_PATH}`, [NESTED_PATH])).toBe(false);
  });

  // The shape that only the anchor can express: a derived exclude naming ONE root-level directory. Left bare it would
  // Read as a name matching at any depth, so `git worktree add app` would drop every `packages/*/app` in the repo
  // From the mirror and mask it out of the write-back.
  test("matches a single-segment anchored path at the root only", () => {
    expect.hasAssertions();

    const anchoredPath = toRootAnchoredExclude(TEST_FILENAME);

    expect(checkIsExcludedPath(TEST_FILENAME, [anchoredPath])).toBe(true);
    expect(checkIsExcludedPath(`${TEST_FILENAME}/${NESTED_PATH}`, [anchoredPath])).toBe(true);
    expect(checkIsExcludedPath(`${NESTED_PATH}/${TEST_FILENAME}`, [anchoredPath])).toBe(false);
    // The same name unanchored is the bare-name shape, which does float — the distinction the anchor exists for.
    expect(checkIsExcludedPath(`${NESTED_PATH}/${TEST_FILENAME}`, [TEST_FILENAME])).toBe(true);
  });

  test("never matches a sibling that merely shares the pattern's prefix", () => {
    expect.hasAssertions();

    // The bug a plain startsWith would ship: `.gitignore` is source and must stay flushable while `.git` is excluded.
    expect(checkIsExcludedPath(`${GIT_DIRECTORY}ignore`, [GIT_DIRECTORY])).toBe(false);
    expect(checkIsExcludedPath(`${TEST_FILENAME}/${GIT_DIRECTORY}ignore`, [GIT_DIRECTORY])).toBe(false);
    expect(checkIsExcludedPath(`${NESTED_PATH}${TEST_FILENAME}`, [NESTED_PATH])).toBe(false);
  });

  test("does not match a path no pattern covers", () => {
    expect.hasAssertions();

    expect(checkIsExcludedPath(`${TEST_FILENAME}/${TEST_FILENAME}`, [GIT_DIRECTORY, NESTED_PATH])).toBe(false);
    expect(checkIsExcludedPath(TEST_FILENAME, [])).toBe(false);
  });
});
