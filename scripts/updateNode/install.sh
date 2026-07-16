#!/bin/sh
new="$1"
old="$2"

# If the caller's shell enabled fnm's built-in corepack support (FNM_COREPACK_ENABLED, set by
# `fnm env --corepack-enabled`), fnm runs `corepack enable` on every install/use/default. Node 25+ no
# longer bundles corepack, so that fires against a binary this fresh version doesn't have yet and hard-errors
# ("Can't enable corepack: Can't spawn program"). Suppress it here and let the block below provision corepack
# ourselves; once it's globally installed, the user's cd-triggered `fnm use --corepack-enabled` resolves fine.
unset FNM_COREPACK_ENABLED

fnm install "$new"
fnm default "$new"
fnm use "$new"
# A freshly installed node has corepack disabled, and Node 25+ no longer bundles corepack at all, so pnpm
# is unavailable until we provide and enable it. This script runs in a nested non-interactive shell where
# `fnm use` can't rewrite PATH, so we can't trust ambient `corepack`/`npm` (they resolve to the OLD version).
# `npm`/`corepack` are node scripts (`#!/usr/bin/env node`), so calling them by absolute path still resolves
# the wrong node off PATH - run them through `fnm exec --using "$new"` so their shebang picks the NEW node.
# (The .ps1 sibling can't do this because fnm exec on Windows won't spawn the .cmd shims; hence its absolute
# path approach. On Unix fnm exec runs these fine.) bin_dir is only used for the corepack existence check.
bin_dir=$(dirname "$(fnm exec --using "$new" -- node -e "process.stdout.write(process.execPath)")")
if [ ! -x "$bin_dir/corepack" ]; then
  fnm exec --using "$new" -- npm install -g corepack
fi
fnm exec --using "$new" -- corepack enable
# Remove the previous node version if it changed. fnm can't delete a version whose node binary is still open,
# so if this call's own node processes still hold $old the synchronous uninstall fails; a detached process
# then retries until they exit. Best-effort - a still-locked version is harmless and removable on a later run.
# We only touch $old, never other installed versions the user may keep for different projects.
if [ -n "$old" ] && [ "$old" != "$new" ]; then
  if ! fnm uninstall "$old" 2>/dev/null; then
    nohup sh -c 'for i in $(seq 60); do fnm uninstall "'"$old"'" 2>/dev/null && break; sleep 1; done' >/dev/null 2>&1 &
    echo "Scheduled removal of node $old (runs once this process exits)."
  fi
fi
