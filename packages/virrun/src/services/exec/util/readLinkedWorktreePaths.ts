import {
  GIT_COMMON_DIRECTORY_FILENAME,
  GIT_DIRECTORY,
  GIT_WORKTREE_GITDIR_FILENAME,
  GIT_WORKTREE_GITDIR_PREFIX,
  GIT_WORKTREES_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { getResult } from "@esposter/shared";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
// Where this tree's git bookkeeping lives: `.git` is that directory in a normal checkout, and a file pointing at
// Another git dir otherwise — `<commonDir>/worktrees/<name>` when the tree is a linked worktree, `<super>/.git/
// Modules/<name>` when it is a submodule. Which of the two it is, and therefore where the repository's single
// Worktree registry sits, is a fact git records rather than one the path's shape can be read for: only a worktree's
// Git dir carries a `commondir`. Stripping two levels unconditionally is right for `worktrees/<name>` and wrong for
// A submodule, whose git dir IS the common dir — resolving it to the superproject's `.git` reads that registry
// Instead, finds none of the submodule's own worktrees, and mirrors every one of them as source.
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
  const gitDirectory = resolve(root, gitdir.slice(GIT_WORKTREE_GITDIR_PREFIX.length).trim());
  // `commondir` is itself resolved against the git dir holding it (git writes `../..` for a worktree entry). Absent,
  // The git dir is its own common dir — the submodule case, and the only reading that does not guess: a worktree
  // Entry git has not finished writing yields no registry, which mirrors a tree we needn't rather than reading the
  // Wrong repository's.
  const commonDirectory = getResult(() => readFileSync(join(gitDirectory, GIT_COMMON_DIRECTORY_FILENAME), "utf8"))
    .unwrapOr("")
    .trim();
  return commonDirectory ? resolve(gitDirectory, commonDirectory) : gitDirectory;
};
// Read the repository's linked worktrees (`git worktree add`) that live INSIDE `cwd`, as posix relative paths.
//
// A linked worktree is a second working tree of the same repository that happens to sit under this one — a whole
// Parallel checkout, not source belonging to the tree it is nested in. It is its own virrun cwd with its own mirror
// Entry, so mirroring it into the parent's set duplicates an entire repo per worktree and swamps every delta with
// Paths no command in this tree reads. Which directories those are is a property of the repository, not of whichever
// Tool created them, so it is read from git's own bookkeeping rather than named: `<commonDir>/worktrees/<name>/gitdir`
// Holds the path of each linked worktree's `.git` file, so the worktree root is that path's parent — and that file
// Must still be there pointing back at the entry, which is the only fact that separates a live worktree from a
// Registry entry whose tree was deleted out from under it. An unregistered directory is just files on disk and
// Mirrors normally; a submodule is another repository's tree and likewise stays in (its git dir lives under
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
    // (`git worktree repair --relative-paths`) resolve against the entry dir holding them, not the process cwd.
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
