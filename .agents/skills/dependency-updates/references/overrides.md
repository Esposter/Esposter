# Overrides

Read when adding or removing an entry in the `overrides:` block of `pnpm-workspace.yaml`. The rule is in `SKILL.md`; this page is the block and what to check before removing an entry.

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Renovate reaches them like catalog entries. Most carry no comment explaining why, so check git blame before removing one.
