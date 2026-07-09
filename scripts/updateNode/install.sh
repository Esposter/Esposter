#!/bin/sh
new="$1"
old="$2"

fnm install "$new"
fnm default "$new"
fnm use "$new"
# A freshly installed node has corepack disabled, and Node 25+ no longer bundles corepack at all, so pnpm
# is unavailable until we provide and enable it. This script runs in a nested non-interactive shell where
# `fnm use` can't rewrite PATH, so we can't trust ambient `corepack`/`npm` (they resolve to the OLD version).
# Resolve the NEW version's bin dir straight from its node binary and invoke corepack/npm there by absolute path.
bin_dir=$(dirname "$(fnm exec --using "$new" -- node -e "process.stdout.write(process.execPath)")")
if [ ! -x "$bin_dir/corepack" ]; then
  "$bin_dir/npm" install -g corepack
fi
"$bin_dir/corepack" enable
# Sweep leftover node versions (see install.ps1 for the full rationale). fnm can't delete a version whose
# node binary is still open, so a long-lived process started on an old version keeps it locked for the whole
# session. So we (1) immediately prune every installed version except the new one - freeing any stranded by a
# PAST update whose processes have since exited - and (2) briefly retry the just-replaced $old in the
# background in case this call's own node processes release it moments later. Best-effort; locked ones fail
# harmlessly and are collected on the NEXT update run.
fnm list | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sort -u | while read -r v; do
  [ "$v" = "v$new" ] || fnm uninstall "$v" 2>/dev/null || true
done
if [ -n "$old" ] && [ "$old" != "$new" ]; then
  nohup sh -c 'for i in $(seq 60); do fnm uninstall "'"$old"'" 2>/dev/null && break; sleep 1; done' >/dev/null 2>&1 &
  echo "Scheduled removal of node $old (runs once this process exits)."
fi
