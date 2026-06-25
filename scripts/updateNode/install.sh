#!/bin/sh
new="$1"
old="$2"

fnm install "$new"
fnm default "$new"
fnm use "$new"
# A freshly installed node has corepack disabled (and future node releases may not bundle it), so pnpm
# is unavailable until we turn it on. Ensure corepack exists, then enable its package-manager shims.
if ! command -v corepack >/dev/null 2>&1; then
  npm install -g corepack
fi
corepack enable
# The old version's directory may be locked while this updater's node processes are alive. Launch a
# detached process that retries `fnm uninstall` until the lock clears - i.e. once this call's node
# processes exit. Self-cleaning, no process killing.
if [ -n "$old" ] && [ "$old" != "$new" ]; then
  nohup sh -c 'for i in $(seq 60); do fnm uninstall "'"$old"'" 2>/dev/null && break; sleep 1; done' >/dev/null 2>&1 &
  echo "Scheduled removal of node $old (runs once this process exits)."
fi
