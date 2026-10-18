#!/usr/bin/env bash
# Removes a worktree without letting git follow a junction out of it: `git worktree remove` deletes through a directory
# junction into the main checkout's node_modules, emptying that install. On Windows every junction under the worktree
# is unlinked first, its target never walked; elsewhere an install links with symlinks, which git removes as links, so
# there is nothing to unlink. A tracked symlink such as `.claude` is git's and stays. The removal keeps git's refusal
# for a dirty worktree, and the worktree's branch is deleted only once the worktree is gone. A folder under the
# worktrees folder that git no longer registers, left by a removal that stopped part way, has nothing for git to refuse
# and is deleted outright.
# Usage: bash .agents/skills/throughput/scripts/remove-worktree.sh <path>
set -euo pipefail
IS_ORPHAN=""
BRANCH=""
if [ -e "$1/.git" ]; then
  BRANCH="$(git -C "$1" symbolic-ref --quiet --short HEAD || true)"
else
  # Without its `.git` the path resolves to the main checkout, so only a folder inside the worktrees folder is taken
  case "$(cd "$1" && pwd)" in
    */.agents/worktrees/?*) IS_ORPHAN=1 ;;
    *)
      echo "Not a worktree: $1" >&2
      exit 1
      ;;
  esac
fi
case "$OSTYPE" in
  msys* | cygwin*)
    WORKTREE="$(cd "$1" && pwd -W)"
    TRASH="$(git -C "$1" rev-parse --path-format=absolute --git-common-dir)/worktree-trash"
    export WORKTREE
    pwsh -NoProfile -Command "Get-ChildItem -LiteralPath \$env:WORKTREE -Recurse -Force -Attributes ReparsePoint | Where-Object { \$_.LinkType -eq 'Junction' } | ForEach-Object { [System.IO.Directory]::Delete(\$_.FullName) }"
    # An install's paths outrun Windows' 260-character limit, which git cannot delete ("Invalid argument"), so every
    # node_modules is removed by node first, whose deletion takes long paths; it is untracked, so git's dirty check is
    # unchanged. A native binary is a hard link into the pnpm store, and while another checkout's process has it loaded
    # Windows refuses to delete any of its links but lets one move, so each is moved into the git directory's trash
    # first, on the same volume, and a later removal deletes it once nothing has it loaded
    node -e '
      const { mkdirSync, readdirSync, renameSync, rm, rmSync } = require("node:fs");
      const { randomUUID } = require("node:crypto");
      const { extname, join } = require("node:path");
      const [worktree, trash, isOrphan] = process.argv.slice(1);
      const loadedExtensions = new Set([".dll", ".exe", ".node"]);
      mkdirSync(trash, { recursive: true });
      for (const name of readdirSync(trash)) rm(join(trash, name), { force: true }, () => {});
      const moveLoaded = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const path = join(directory, entry.name);
          const extension = extname(entry.name);
          if (entry.isDirectory()) moveLoaded(path);
          else if (loadedExtensions.has(extension)) renameSync(path, join(trash, `${randomUUID()}${extension}`));
        }
      };
      const remove = (path) => {
        moveLoaded(path);
        rmSync(path, { force: true, maxRetries: 3, recursive: true });
      };
      const walk = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          if (!entry.isDirectory() || entry.name === ".git") continue;
          const path = join(directory, entry.name);
          if (entry.name === "node_modules") remove(path);
          else walk(path);
        }
      };
      if (isOrphan) remove(worktree);
      else walk(worktree);
    ' "$WORKTREE" "$TRASH" "$IS_ORPHAN"
    ;;
esac
if [ -n "$IS_ORPHAN" ]; then
  rm -rf "$1"
else
  git worktree remove "$1"
fi
git worktree prune
# A branch whose tip `origin/ai/queue` once held has landed, even where `-d` would refuse it as unmerged into the
# current branch; any other is left to `-d`, which refuses one holding unlanded commits
if [ -n "$BRANCH" ]; then
  if [ "$(git merge-base --fork-point origin/ai/queue "$BRANCH" || true)" = "$(git rev-parse "$BRANCH")" ]; then
    git branch -D "$BRANCH"
  else
    git branch -d "$BRANCH"
  fi
fi
