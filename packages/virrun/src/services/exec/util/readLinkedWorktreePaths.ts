import {
  GIT_DIRECTORY,
  GIT_WORKTREE_GITDIR_FILENAME,
  GIT_WORKTREE_GITDIR_PREFIX,
  GIT_WORKTREES_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { getResult } from "@esposter/shared";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
// Where this tree's git bookkeeping lives: `.git` is that directory in a normal checkout, and a file pointing at
// `<commonDir>/worktrees/<name>` when the tree is itself a linked worktree — in which case the common dir is two
// Levels up, so a worktree nested inside a worktree still resolves against the repository's single registry.
const readGitCommonDirectory = (root: string): string | undefined => {
  const gitPath = join(root, GIT_DIRECTORY);
  const stats = getResult(() => lstatSync(gitPath)).unwrapOr(undefined);
  if (stats === undefined) return undefined;
  else if (stats.isDirectory()) return gitPath;
  const gitdir = getResult(() => readFileSync(gitPath, "utf8")).unwrapOr("");
  if (!gitdir.startsWith(GIT_WORKTREE_GITDIR_PREFIX)) return undefined;
  // Resolved against the record's own directory, never the process cwd: git writes this path relative whenever the
  // Repo is on relative worktrees (`worktree.useRelativePaths`, git 2.48+) or is a submodule (always
  // `gitdir: ../.git/modules/<name>`), and anchoring it anywhere else lands outside the repo — which reads as "no
  // Registry", so every nested worktree silently mirrors again.
  return dirname(dirname(resolve(root, gitdir.slice(GIT_WORKTREE_GITDIR_PREFIX.length).trim())));
};
// Read the repository's linked worktrees (`git worktree add`) that live INSIDE `cwd`, as posix relative paths.
//
// A linked worktree is a second working tree of the same repository that happens to sit under this one — a whole
// Parallel checkout, not source belonging to the tree it is nested in. It is its own virrun cwd with its own mirror
// Entry, so mirroring it into the parent's set duplicates an entire repo per worktree and swamps every delta with
// Paths no command in this tree reads. Which directories those are is a property of the repository, not of whichever
// Tool created them, so it is read from git's own bookkeeping rather than named: `<commonDir>/worktrees/<name>/gitdir`
// Holds the absolute path of each linked worktree's `.git` file, so the worktree root is that path's parent. An
// Unregistered directory is just files on disk and mirrors normally; a submodule is another repository's tree and
// Likewise stays in (its git dir lives under `modules/`, never `worktrees/`).
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
    const gitdirFile = join(worktreesDirectory, entry, GIT_WORKTREE_GITDIR_FILENAME);
    const gitdir = getResult(() => readFileSync(gitdirFile, "utf8"))
      .unwrapOr("")
      .trim();
    if (!gitdir) continue;
    // The recorded path is the worktree's own `.git` file, so its parent is the worktree root. Relative records
    // (`git worktree repair --relative-paths`) resolve against the entry dir holding them, not the process cwd.
    const relativePath = relative(root, dirname(resolve(join(worktreesDirectory, entry), gitdir))).replaceAll(
      "\\",
      "/",
    );
    // Only a worktree nested inside this tree is this mirror's problem; a sibling checkout is outside the walk anyway.
    // What escapes the root is a leading `..` SEGMENT — a directory whose NAME merely starts with those characters
    // (`..worktree`) is nested like any other, and dropping it would mirror a whole parallel checkout unmasked.
    if (!relativePath || relativePath === ".." || relativePath.startsWith("../") || isAbsolute(relativePath)) continue;
    paths.push(relativePath);
  }
  return paths.toSorted();
};
