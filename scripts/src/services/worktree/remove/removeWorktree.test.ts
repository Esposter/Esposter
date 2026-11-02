import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runGit } from "#src/services/shared/runGit";
import { NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";
import { removeWorktree } from "#src/services/worktree/remove/removeWorktree";
import { getResult, noop } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  // Git keeps a record of a worktree whose folder has gone until it is pruned, and the removal refuses a missing folder.
  // The record must be pruned on that refusal too, or the listing keeps a worktree nothing holds.
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

  // The main checkout is not a linked worktree, and its installs are the ones every other checkout's point into. The refusal
  // comes before any install is touched, on every platform, so the installs are still there after it
  test("refuses the main checkout before any install is removed", () => {
    expect.hasAssertions();

    const installPath = join(repositoryRoot, NODE_MODULES_FOLDER, TEST_FILENAME);
    mkdirSync(join(repositoryRoot, NODE_MODULES_FOLDER));
    writeFileSync(installPath, "");

    const error = getResult(() => {
      removeWorktree(repositoryRoot, repositoryRoot);
    }).match(noop, (failure) => failure);

    expect(error?.message).toBe(
      `Invalid operation: Delete, name: ${repositoryRoot}, it is the main checkout, and only a linked worktree is removed`,
    );
    expect(existsSync(installPath)).toBe(true);
  });

  // Git refuses a linked worktree with uncommitted changes only after its installs are gone on Windows, so the refusal is made
  // first, and the installs of the worktree are still there after it
  test("refuses a linked worktree with uncommitted changes before any install is removed", () => {
    expect.hasAssertions();

    const worktreePath = join(repositoryRoot, TEST_FILENAME);
    runGit(["worktree", "add", "--detach", worktreePath], repositoryRoot);
    const installPath = join(worktreePath, NODE_MODULES_FOLDER, TEST_FILENAME);
    mkdirSync(join(worktreePath, NODE_MODULES_FOLDER));
    writeFileSync(installPath, "");
    writeFileSync(join(worktreePath, TEST_FILENAME), "");

    const error = getResult(() => {
      removeWorktree(worktreePath, repositoryRoot);
    }).match(noop, (failure) => failure);

    expect(error?.message).toBe(
      `Invalid operation: Delete, name: ${worktreePath}, it has uncommitted or untracked changes`,
    );
    expect(existsSync(installPath)).toBe(true);
  });
});
