#!/usr/bin/env sh
rm -rf pnpm-lock.yaml

# Collect every node_modules, pruning (not descending into) matched dirs.
targets=$(find . -name "node_modules" -type d -prune)
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
