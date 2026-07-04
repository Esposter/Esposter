Key the prepare layer on the inputs `nuxt prepare` actually reads instead of the whole source-tree hash, so a one-file edit stops invalidating the `.nuxt` regen.

## Why deferred

With an `environment` preset, the prepare layer is keyed by `computeSourceTreeHash` — any source edit re-keys it and the next run pays the full framework regen (~10s of `nuxt prepare` on this repo). Post mirror-delta-sync this is the single biggest remaining win32 dev-loop cost on a dirty tree (measured: clean rerun ~5–6s, one-file-change rerun ~16–20s, almost all prepare regen). But the full-tree key is the only key **proven safe**: `nuxt prepare` output depends not just on config and dependencies but on source _contents_ (auto-import names, typed routes from `definePageMeta`, component/page file scans), and no reliable "prepare-relevant inputs" predicate exists today. A too-narrow key silently serves stale `.nuxt` types — a correctness failure worse than the latency. The task cache already blunts the cost for repeated commands on the same tree state; only the first run per tree state pays.

## Revisit when

A provably sufficient prepare-input set exists — e.g. Nuxt exposes its scan globs/dependency manifest, or a conservative composite key (config files + lockfile + scanned-dir file-name list + `definePageMeta`-bearing file contents) is validated against a differential gate that diffs regenerated `.nuxt` output across source edits.
