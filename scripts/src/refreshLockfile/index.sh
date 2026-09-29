#!/usr/bin/env sh
rm -rf pnpm-lock.yaml

# Every other worktree of this repository nests inside the main checkout, under .agents/worktrees, and is a workspace
# Of its own whose node_modules belong to whichever session is working there. Git names them, each with a trailing
# Separator so a sibling whose path extends one is not caught with it
workspace=$(pwd -P)
nestedWorktrees=$(git worktree list --porcelain | sed -n 's/^worktree //p' | grep -F "$workspace/" | sed 's|$|/|')

# Collect every node_modules, pruning (not descending into) matched dirs, and leave out the nested worktrees'.
targets=$(find "$workspace" -name "node_modules" -type d -prune)
if [ -n "$nestedWorktrees" ]; then
  targets=$(printf '%s\n' "$targets" | grep -vF "$nestedWorktrees")
fi
total=$(printf '%s\n' "$targets" | grep -c .)

i=0
printf '%s\n' "$targets" | while IFS= read -r dir; do
  [ -z "$dir" ] && continue
  i=$((i + 1))
  printf '\r[%d/%d] removing %s\033[K' "$i" "$total" "$dir"
  rm -rf "$dir"
done
printf '\n'

pnpm i
