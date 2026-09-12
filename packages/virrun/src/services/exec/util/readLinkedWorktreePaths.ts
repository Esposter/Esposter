import {
  GIT_WORKTREE_GITDIR_FILENAME,
  GIT_WORKTREE_GITDIR_PREFIX,
  GIT_WORKTREES_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { readGitCommonDirectory } from "#src/services/exec/util/readGitCommonDirectory";
import { getResult } from "@esposter/shared";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
// Read the repository's linked worktrees (`git worktree add`) that live INSIDE `cwd`, as posix relative paths.
//
// A linked worktree is a second working tree of the same repository that happens to sit under this one — a whole
// Parallel checkout, not source belonging to the tree it is nested in. It is its own virrun cwd with its own mirror
// Entry, so mirroring it into the parent's set duplicates an entire repo per worktree and swamps every delta with
// Paths no command in this tree reads. Which directories those are is a property of the repository, not of whichever
// Tool created them, so it is read from git's own bookkeeping rather than named: `<commonDirectory>/worktrees/<name>/gitdir`
// Holds the path of each linked worktree's `.git` file, so the worktree root is that path's parent — and that file
// Must still be there pointing back at the entry, which is the only fact that separates a live worktree from a
// Registry entry whose tree was deleted out from under it. An unregistered directory is just files on disk and
// Mirrors normally; a submodule is another repository's tree and likewise stays in (its git directory lives under
// `modules/`, never `worktrees/`).
//
// Reads only: a repo with no linked worktrees costs one failed `worktrees` readdir, and anything unreadable or
// Malformed drops out rather than throwing — an exclude we fail to derive costs mirroring a tree we needn't, which is
// The safe direction.
export const readLinkedWorktreePaths = (cwd: string): readonly string[] => {
  const root = resolve(cwd);
  const commonDirectory = readGitCommonDirectory(root);
  if (commonDirectory === undefined) return [];
  const worktreesDirectory = join(commonDirectory, GIT_WORKTREES_DIRECTORY_NAME);
  const entries = getResult(() => readdirSync(worktreesDirectory)).unwrapOr([]);
  const paths: string[] = [];
  for (const entry of entries) {
    const entryDirectory = join(worktreesDirectory, entry);
    const gitdirFile = join(entryDirectory, GIT_WORKTREE_GITDIR_FILENAME);
    const gitdir = getResult(() => readFileSync(gitdirFile, "utf8"))
      .unwrapOr("")
      .trim();
    if (!gitdir) continue;
    // The recorded path is the worktree's own `.git` file, so its parent is the worktree root. Relative records
    // (`git worktree repair --relative-paths`) resolve against the entry directory holding them, not the process cwd.
    const worktreeGitPath = resolve(entryDirectory, gitdir);
    // A registry entry outlives the tree it names: `rm -rf`ing a worktree instead of `git worktree remove` leaves the
    // Entry until a `git worktree prune` that only runs under gc, and the path is then free for a real source
    // Directory to take. Excluding on the entry alone would drop that directory out of the mirror AND out of the
    // Write-back mask — the sandbox sees nothing there and everything the command writes under it is discarded, with
    // No diagnostic naming the exclude. So the exclude reads the link git itself prunes on: the worktree's `.git`
    // File must exist and point back at THIS entry. Whatever else occupies the path — a plain directory, a nested
    // Repository's `.git` directory (unreadable as a file), another worktree's tree — is source and is mirrored.
    const backRecord = getResult(() => readFileSync(worktreeGitPath, "utf8"))
      .unwrapOr("")
      .trim();
    if (!backRecord.startsWith(GIT_WORKTREE_GITDIR_PREFIX)) continue;
    const backDirectory = resolve(dirname(worktreeGitPath), backRecord.slice(GIT_WORKTREE_GITDIR_PREFIX.length).trim());
    // Compared as paths, not strings: `relative` is case-insensitive on win32, so a record git wrote with a different
    // Drive-letter case still matches the entry it names.
    if (relative(backDirectory, resolve(entryDirectory)) !== "") continue;
    const relativePath = relative(root, dirname(worktreeGitPath)).replaceAll("\\", "/");
    // Only a worktree nested inside this tree is this mirror's problem; a sibling checkout is outside the walk anyway.
    // What escapes the root is a leading `..` SEGMENT — a directory whose NAME merely starts with those characters
    // (`..worktree`) is nested like any other, and dropping it would mirror a whole parallel checkout unmasked.
    if (!relativePath || relativePath === ".." || relativePath.startsWith("../") || isAbsolute(relativePath)) continue;
    paths.push(relativePath);
  }
  return paths.toSorted();
};
