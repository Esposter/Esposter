import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { checkIsOrphanPath } from "#src/services/worktree/remove/checkIsOrphanPath";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe(checkIsOrphanPath, () => {
  test("accepts a folder directly in this checkout's worktrees folder, and refuses one in another checkout's", () => {
    expect.hasAssertions();

    const mainCheckoutRoot = resolve(TEST_FILENAME);
    const otherCheckoutRoot = resolve(TEST_FILENAME, TEST_FILENAME);

    expect(checkIsOrphanPath(join(mainCheckoutRoot, AGENT_WORKTREES_DIRECTORY, TEST_FILENAME), mainCheckoutRoot)).toBe(
      true,
    );
    expect(checkIsOrphanPath(join(otherCheckoutRoot, AGENT_WORKTREES_DIRECTORY, TEST_FILENAME), mainCheckoutRoot)).toBe(
      false,
    );
    expect(checkIsOrphanPath(mainCheckoutRoot, mainCheckoutRoot)).toBe(false);
  });
});
