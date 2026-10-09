#!/usr/bin/env bash
# Removes a worktree without letting git follow a junction out of it: `git worktree remove` deletes through a directory
# junction into the shared checkout's node_modules, emptying that install. On Windows every junction under the worktree
# is unlinked first, its target never walked; elsewhere an install links with symlinks, which git removes as links, so
# there is nothing to unlink. A tracked symlink such as `.claude` is git's and stays. The removal keeps git's refusal
# for a dirty worktree. Usage: bash .agents/skills/throughput/scripts/remove-worktree.sh <path>
set -euo pipefail
case "$OSTYPE" in
  msys* | cygwin*)
    WORKTREE="$(cd "$1" && pwd -W)"
    export WORKTREE
    pwsh -NoProfile -Command "Get-ChildItem -LiteralPath \$env:WORKTREE -Recurse -Force -Attributes ReparsePoint | Where-Object { \$_.LinkType -eq 'Junction' } | ForEach-Object { [System.IO.Directory]::Delete(\$_.FullName) }"
    # An install's paths outrun Windows' 260-character limit, which git cannot delete ("Invalid argument"), so every
    # node_modules is removed by node first, whose deletion takes long paths; it is untracked, so git's dirty check is
    # unchanged
    node -e 'const { readdirSync, rmSync } = require("node:fs"); const { join } = require("node:path"); const walk = (directory) => { for (const entry of readdirSync(directory, { withFileTypes: true })) { if (!entry.isDirectory() || entry.name === ".git") continue; const path = join(directory, entry.name); if (entry.name === "node_modules") rmSync(path, { force: true, maxRetries: 3, recursive: true }); else walk(path); } }; walk(process.argv[1]);' "$WORKTREE"
    ;;
esac
git worktree remove "$1"
git worktree prune
