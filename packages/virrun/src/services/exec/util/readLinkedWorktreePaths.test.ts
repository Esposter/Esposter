import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import {
  GIT_DIRECTORY,
  GIT_WORKTREE_GITDIR_FILENAME,
  GIT_WORKTREE_GITDIR_PREFIX,
  GIT_WORKTREES_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { readLinkedWorktreePaths } from "@/services/exec/util/readLinkedWorktreePaths";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const WORKTREE_NAME = "b";
const DOT_PREFIXED_WORKTREE_NAME = `..${WORKTREE_NAME}`;

describe(readLinkedWorktreePaths, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cwd = "";
  // Git's own bookkeeping for one linked worktree: `<commonDir>/worktrees/<name>/gitdir` holds the absolute path of
  // That worktree's `.git` file, whose parent is the worktree root.
  const registerWorktree = (name: string, worktreeRoot: string): void => {
    const entryDirectory = join(cwd, GIT_DIRECTORY, GIT_WORKTREES_DIRECTORY_NAME, name);
    mkdirSync(entryDirectory, { recursive: true });
    writeFileSync(join(entryDirectory, GIT_WORKTREE_GITDIR_FILENAME), `${join(worktreeRoot, GIT_DIRECTORY)}\n`);
  };

  beforeEach(() => {
    cwd = create();
    mkdirSync(join(cwd, GIT_DIRECTORY), { recursive: true });
  });

  afterEach(cleanup);

  test("reads a nested worktree as a posix relative path", () => {
    expect.hasAssertions();

    const worktreePath = `${TEST_FILENAME}/${WORKTREE_NAME}`;
    registerWorktree(WORKTREE_NAME, join(cwd, TEST_FILENAME, WORKTREE_NAME));

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([worktreePath]);
  });

  test("ignores a worktree outside the tree, which the walk never reaches anyway", () => {
    expect.hasAssertions();

    registerWorktree(WORKTREE_NAME, create());

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);
  });

  test("returns nothing for a repo with no linked worktrees, and for a directory that is not a repo", () => {
    expect.hasAssertions();

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);
    expect(readLinkedWorktreePaths(create())).toStrictEqual([]);
  });

  // Anything unreadable or malformed drops out instead of throwing: failing to derive an exclude costs mirroring a
  // Tree we needn't, while throwing would fail the run outright.
  test("skips an entry whose gitdir record is missing or empty", () => {
    expect.hasAssertions();

    const entryDirectory = join(cwd, GIT_DIRECTORY, GIT_WORKTREES_DIRECTORY_NAME, WORKTREE_NAME);
    mkdirSync(entryDirectory, { recursive: true });

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);

    writeFileSync(join(entryDirectory, GIT_WORKTREE_GITDIR_FILENAME), "");

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);
  });

  // Only a leading `..` segment escapes the root — a name that merely starts with those characters is nested, and
  // Reading it as outside would leave a whole parallel checkout mirrored.
  test("reads a nested worktree whose directory name starts with two dots", () => {
    expect.hasAssertions();

    registerWorktree(WORKTREE_NAME, join(cwd, DOT_PREFIXED_WORKTREE_NAME));

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([DOT_PREFIXED_WORKTREE_NAME]);
  });

  // Run from inside a linked worktree, `.git` is a file pointing at the entry in the repo's single registry — so a
  // Worktree nested under THIS one still resolves, rather than the tree reading as a non-repo.
  test("resolves the registry through a .git file when the tree is itself a linked worktree", () => {
    expect.hasAssertions();

    const mainRepository = cwd;
    registerWorktree(WORKTREE_NAME, join(mainRepository, TEST_FILENAME, WORKTREE_NAME));
    const worktree = join(mainRepository, TEST_FILENAME, WORKTREE_NAME);
    mkdirSync(worktree, { recursive: true });
    const entryDirectory = join(mainRepository, GIT_DIRECTORY, GIT_WORKTREES_DIRECTORY_NAME, WORKTREE_NAME);
    writeFileSync(join(worktree, GIT_DIRECTORY), `${GIT_WORKTREE_GITDIR_PREFIX}${entryDirectory}\n`);

    // The registry is the main repo's, so from the worktree the sibling entry resolves to a path outside it — the
    // Point being that the lookup succeeded rather than bailing on a `.git` that is not a directory.
    expect(readLinkedWorktreePaths(worktree)).toStrictEqual([]);
    expect(readLinkedWorktreePaths(mainRepository)).toStrictEqual([`${TEST_FILENAME}/${WORKTREE_NAME}`]);
  });
});
