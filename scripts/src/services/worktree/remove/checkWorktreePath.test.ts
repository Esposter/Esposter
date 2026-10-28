import { checkWorktreePath } from "#src/services/worktree/remove/checkWorktreePath";
import { describe, expect, test } from "vitest";

describe(checkWorktreePath, () => {
  test("refuses a relative path, naming that it resolves against the working directory", () => {
    expect.hasAssertions();

    expect(() => {
      checkWorktreePath(".agents/worktrees/settle-1");
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: .agents/worktrees/settle-1, a relative path resolves against the working directory; give the worktree's full path]`,
    );
  });

  test("accepts a full path", () => {
    expect.hasAssertions();

    expect(() => {
      checkWorktreePath("/main/.agents/worktrees/settle-1");
    }).not.toThrow();
  });
});
