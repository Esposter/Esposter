import {
  GIT_COMMON_DIRECTORY_FILENAME,
  GIT_DIRECTORY,
  GIT_WORKTREE_GITDIR_PREFIX,
} from "#src/services/exec/util/constants";
import { getResult } from "@esposter/shared";
import { lstatSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Where this tree's git bookkeeping lives: `.git` is that directory in a normal checkout, and a file pointing at
// Another git directory otherwise — `<commonDirectory>/worktrees/<name>` when the tree is a linked worktree,
// `<super>/.git/modules/<name>` when it is a submodule. Which of the two it is, and therefore where the repository's
// Single worktree registry sits, is a fact git records rather than one the path's shape can be read for: only a
// Worktree's git directory carries a `commondir`. Stripping two levels unconditionally is right for `worktrees/<name>`
// And wrong for a submodule, whose git directory IS the common directory — resolving it to the superproject's `.git`
// Reads that registry instead, finds none of the submodule's own worktrees, and mirrors every one of them as source.
export const readGitCommonDirectory = (root: string): string | undefined => {
  const gitPath = join(root, GIT_DIRECTORY);
  const stats = getResult(() => lstatSync(gitPath)).unwrapOr(undefined);
  if (stats === undefined) return undefined;
  else if (stats.isDirectory()) return gitPath;
  else {
    const gitdir = getResult(() => readFileSync(gitPath, "utf8")).unwrapOr("");
    if (!gitdir.startsWith(GIT_WORKTREE_GITDIR_PREFIX)) return undefined;
    // Resolved against the record's own directory, never the process cwd: git writes this path relative whenever the
    // Repo is on relative worktrees (`worktree.useRelativePaths`, git 2.48+) or is a submodule (always
    // `gitdir: ../.git/modules/<name>`), and anchoring it anywhere else lands outside the repo — which reads as "no
    // Registry", so every nested worktree silently mirrors again.
    const gitDirectory = resolve(root, gitdir.slice(GIT_WORKTREE_GITDIR_PREFIX.length).trim());
    // `commondir` is itself resolved against the git directory holding it (git writes `../..` for a worktree entry).
    // Absent, the git directory is its own common directory — the submodule case, and the only reading that does not
    // Guess: a worktree entry git has not finished writing yields no registry, which mirrors a tree we needn't rather
    // Than reading the wrong repository's.
    const commonDirectory = getResult(() => readFileSync(join(gitDirectory, GIT_COMMON_DIRECTORY_FILENAME), "utf8"))
      .unwrapOr("")
      .trim();
    return commonDirectory ? resolve(gitDirectory, commonDirectory) : gitDirectory;
  }
};
