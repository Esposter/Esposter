import { getWorktreeName } from "#src/services/genshinParity/shared/getWorktreeName";
import { SITE_NAME } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { join } from "node:path";

describe(getWorktreeName, () => {
  test("should name a worktree by its folder under .agents/worktrees, and the shared checkout main", () => {
    expect.hasAssertions();

    const REPOSITORY_ROOT = join(SITE_NAME);
    const WORKTREE_NAME = "w6-parity-agent-tools";

    expect(getWorktreeName(join(REPOSITORY_ROOT, ".agents", "worktrees", WORKTREE_NAME))).toBe(WORKTREE_NAME);
    expect(getWorktreeName(REPOSITORY_ROOT)).toBe("main");
  });
});
