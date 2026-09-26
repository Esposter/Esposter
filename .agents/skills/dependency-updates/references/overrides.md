# Overrides

Read when adding or removing an entry in the `overrides:` block of `pnpm-workspace.yaml`.

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Renovate reaches them like catalog entries. Remove one when the upstream package catches up; most carry no comment explaining why, so check git blame before removing one.
