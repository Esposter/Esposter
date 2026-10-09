#!/usr/bin/env bash
# Removes a worktree without letting git follow a junction out of it: `git worktree remove` deletes through a directory
# junction into the shared checkout's node_modules, emptying that install. Every junction under the worktree is unlinked
# first, its target never walked; a tracked symlink such as `.claude` is git's and stays. The removal keeps git's refusal
# for a dirty worktree. Usage: bash .agents/skills/throughput/scripts/remove-worktree.sh <path>
set -euo pipefail
worktree="$(cd "$1" && pwd -W)"
pwsh -NoProfile -Command "Get-ChildItem -LiteralPath '$worktree' -Recurse -Force -Attributes ReparsePoint | Where-Object { \$_.LinkType -eq 'Junction' } | ForEach-Object { [System.IO.Directory]::Delete(\$_.FullName) }"
git worktree remove "$1"
git worktree prune
