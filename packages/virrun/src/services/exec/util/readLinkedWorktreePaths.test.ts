import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import {
  GIT_COMMON_DIRECTORY_FILENAME,
  GIT_DIRECTORY,
  GIT_WORKTREE_GITDIR_FILENAME,
  GIT_WORKTREE_GITDIR_PREFIX,
  GIT_WORKTREES_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { readLinkedWorktreePaths } from "#src/services/exec/util/readLinkedWorktreePaths";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Git's own bookkeeping for one linked worktree, both halves of it: `<commonDir>/worktrees/<name>/gitdir` holds the
// Path of that worktree's `.git` file (whose parent is the worktree root), that git dir records the common dir it
// Belongs to, and the worktree's `.git` file points back at the entry. `gitdirRecord` overrides only the outward
// Record, for the relative-path form git writes under `worktree.useRelativePaths`.
const registerWorktree = (commonDirectory: string, name: string, worktreeRoot: string, gitdirRecord = ""): void => {
  const entryDirectory = join(commonDirectory, GIT_WORKTREES_DIRECTORY_NAME, name);
  mkdirSync(entryDirectory, { recursive: true });
  writeFileSync(
    join(entryDirectory, GIT_WORKTREE_GITDIR_FILENAME),
    `${gitdirRecord || join(worktreeRoot, GIT_DIRECTORY)}\n`,
  );
  writeFileSync(join(entryDirectory, GIT_COMMON_DIRECTORY_FILENAME), "../..\n");
  mkdirSync(worktreeRoot, { recursive: true });
  writeFileSync(join(worktreeRoot, GIT_DIRECTORY), `${GIT_WORKTREE_GITDIR_PREFIX}${entryDirectory}\n`);
};

describe(readLinkedWorktreePaths, () => {
  const WORKTREE_NAME = "b";
  const DOT_PREFIXED_WORKTREE_NAME = `..${WORKTREE_NAME}`;
  const SUBMODULE_NAME = "sub";
  // Where git keeps a submodule's git dir inside the superproject — a directory this module never names, since the
  // Common dir is read from `commondir` rather than inferred from the layout; the test builds the real thing.
  const GIT_MODULES_DIRECTORY_NAME = "modules";

  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cwd = "";
  const register = (name: string, worktreeRoot: string, gitdirRecord = ""): void => {
    registerWorktree(join(cwd, GIT_DIRECTORY), name, worktreeRoot, gitdirRecord);
  };

  beforeEach(() => {
    cwd = create();
    mkdirSync(join(cwd, GIT_DIRECTORY), { recursive: true });
  });

  afterEach(cleanup);

  test("reads a nested worktree as a posix relative path", () => {
    expect.hasAssertions();

    const worktreePath = `${TEST_FILENAME}/${WORKTREE_NAME}`;
    register(WORKTREE_NAME, join(cwd, TEST_FILENAME, WORKTREE_NAME));

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([worktreePath]);
  });

  test("ignores a worktree outside the tree, which the walk never reaches anyway", () => {
    expect.hasAssertions();

    register(WORKTREE_NAME, create());

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

    register(WORKTREE_NAME, join(cwd, DOT_PREFIXED_WORKTREE_NAME));

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([DOT_PREFIXED_WORKTREE_NAME]);
  });

  // A registry entry survives `rm -rf <worktree>` until a `git worktree prune` that only runs under gc, and the path
  // Is then free for real source to occupy. Trusting the entry alone keeps that directory out of the mirror AND out
  // Of the write-back mask: the sandbox never sees it (imports from it fail to resolve) and everything the command
  // Writes under it is silently dropped. Git's own prune signal — the worktree's `.git` file — is the fact here.
  test("skips an entry whose worktree was deleted and its path retaken by real source", () => {
    expect.hasAssertions();

    const worktreeRoot = join(cwd, TEST_FILENAME, WORKTREE_NAME);
    register(WORKTREE_NAME, worktreeRoot);
    rmSync(worktreeRoot, { force: true, recursive: true });
    mkdirSync(join(worktreeRoot, TEST_FILENAME), { recursive: true });

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);
  });

  // Only THIS entry's worktree may be excluded on it: a `.git` file at the recorded path pointing somewhere else is
  // Another tree that happens to sit there, and dropping it would mask real source out of both directions.
  test("skips an entry whose worktree points back at a different entry", () => {
    expect.hasAssertions();

    const worktreeRoot = join(cwd, TEST_FILENAME, WORKTREE_NAME);
    register(WORKTREE_NAME, worktreeRoot);
    writeFileSync(
      join(worktreeRoot, GIT_DIRECTORY),
      `${GIT_WORKTREE_GITDIR_PREFIX}${join(cwd, GIT_DIRECTORY, GIT_WORKTREES_DIRECTORY_NAME, DOT_PREFIXED_WORKTREE_NAME)}\n`,
    );

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([]);
  });

  // Git writes this record relative whenever the repo is on relative worktrees (`worktree.useRelativePaths`, git
  // 2.48+ / `git worktree repair --relative-paths`). Resolved against the process cwd it lands outside the repo and
  // Reads as "no worktrees at all", so every nested worktree would be mirrored again — the regression this exclude
  // Exists to stop, restored silently.
  test("resolves a relative gitdir record against the entry directory, not the process cwd", () => {
    expect.hasAssertions();

    const entryDirectory = join(cwd, GIT_DIRECTORY, GIT_WORKTREES_DIRECTORY_NAME, WORKTREE_NAME);
    const worktreeRoot = join(cwd, TEST_FILENAME, WORKTREE_NAME);
    register(
      WORKTREE_NAME,
      worktreeRoot,
      relative(entryDirectory, join(worktreeRoot, GIT_DIRECTORY)).replaceAll("\\", "/"),
    );

    expect(readLinkedWorktreePaths(cwd)).toStrictEqual([`${TEST_FILENAME}/${WORKTREE_NAME}`]);
  });

  // Run from inside a linked worktree, `.git` is a file pointing at the entry in the repo's single registry — so a
  // Worktree nested under THIS one still resolves, rather than the tree reading as a non-repo.
  test("resolves the registry through a .git file when the tree is itself a linked worktree", () => {
    expect.hasAssertions();

    const mainRepository = cwd;
    const worktree = join(mainRepository, TEST_FILENAME, WORKTREE_NAME);
    register(WORKTREE_NAME, worktree);

    // The registry is the main repo's, so from the worktree the sibling entry resolves to a path outside it — the
    // Point being that the lookup succeeded rather than bailing on a `.git` that is not a directory.
    expect(readLinkedWorktreePaths(worktree)).toStrictEqual([]);
    expect(readLinkedWorktreePaths(mainRepository)).toStrictEqual([`${TEST_FILENAME}/${WORKTREE_NAME}`]);
  });

  // A submodule's `.git` file points at `<super>/.git/modules/<name>`, which IS its common dir — it holds no
  // `commondir`. Stripping two levels off it lands on the superproject's `.git`, whose registry holds none of the
  // Submodule's worktrees, so every one of them mirrors as source: a whole parallel checkout per worktree swamping
  // The delta, which is the exact regression this exclude exists to close.
  test("reads the submodule's own registry rather than the superproject's", () => {
    expect.hasAssertions();

    const superProject = cwd;
    const submodule = join(superProject, SUBMODULE_NAME);
    const submoduleGitDirectory = join(superProject, GIT_DIRECTORY, GIT_MODULES_DIRECTORY_NAME, SUBMODULE_NAME);
    mkdirSync(submodule, { recursive: true });
    mkdirSync(submoduleGitDirectory, { recursive: true });
    writeFileSync(
      join(submodule, GIT_DIRECTORY),
      `${GIT_WORKTREE_GITDIR_PREFIX}${relative(submodule, submoduleGitDirectory).replaceAll("\\", "/")}\n`,
    );
    registerWorktree(submoduleGitDirectory, WORKTREE_NAME, join(submodule, TEST_FILENAME, WORKTREE_NAME));

    expect(readLinkedWorktreePaths(submodule)).toStrictEqual([`${TEST_FILENAME}/${WORKTREE_NAME}`]);
  });
});
