import { runGit } from "#src/services/shared/runGit";
import { removeWorktree } from "#src/services/worktree/remove/removeWorktree";
import { getResult, noop } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(removeWorktree, () => {
  let repositoryRoot = "";

  beforeEach(() => {
    repositoryRoot = mkdtempSync(join(tmpdir(), "remove-worktree-"));
    runGit(["init", "--quiet"], repositoryRoot);
    runGit(
      ["-c", "user.name=test", "-c", "user.email=test@example.com", "commit", "--allow-empty", "--quiet", "-m", "init"],
      repositoryRoot,
    );
  });

  afterEach(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  // Git keeps a record of a worktree whose folder has gone until it is pruned, and the removal refuses a missing folder,
  // so the record must be pruned on that refusal too or the listing keeps a worktree nothing holds
  test("prunes the record of a worktree whose folder is already gone, before it names the missing folder", () => {
    expect.hasAssertions();

    const worktreePath = join(repositoryRoot, "gone");
    runGit(["worktree", "add", "--detach", worktreePath], repositoryRoot);
    rmSync(worktreePath, { force: true, recursive: true });

    const error = getResult(() => {
      removeWorktree(worktreePath, repositoryRoot);
    }).match(noop, (failure) => failure);

    expect(error?.message).toBe(`Invalid operation: Delete, name: ${worktreePath}, there is no folder at this path`);
    expect(
      runGit(["worktree", "list", "--porcelain"], repositoryRoot)
        .split("\n")
        .filter((line) => line.startsWith("worktree ")),
    ).toHaveLength(1);
  });
});
