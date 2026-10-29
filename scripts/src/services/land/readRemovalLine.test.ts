import { readRemovalLine } from "#src/services/land/readRemovalLine";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(readRemovalLine, () => {
  test("names a worktree the landing removed", () => {
    expect.hasAssertions();

    expect(readRemovalLine(TEST_FILENAME, true)).toBe(`removed ${TEST_FILENAME}`);
  });

  test("names a worktree the removal left in place, with the command that removes it from outside", () => {
    expect.hasAssertions();

    expect(readRemovalLine(TEST_FILENAME, false)).toBe(
      `landed, worktree not removed: ${TEST_FILENAME}, run pnpm ai:worktree:remove ${TEST_FILENAME}`,
    );
  });
});
