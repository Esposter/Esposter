# Genshin evidence

One row per spec folder under `openspec/specs/genshin`, derived from the tree by `LedgerUnitsMap`: the folder is the unit, and its `design.md` and `spec.md` are read together.

Find recipe: `pnpm ai:sweep:genshin-evidence` prints each design either test opens. A folder is open when its design is open, and a design is open when either test holds. A `no source yet` on an unchecked `- [ ]` task line is an open question the task names, and opens nothing.

Test one: a `no source yet` anywhere else in a design.

Test two: a design with no `## Sources` section and no `genshin-parity/references/` path.

A pass sweeps the union of both. The spec side has no recipe here: `scripts/src/services/openspec/lintRequirementSources.ts` checks every requirement body, and `readSpecFindings.test.ts` runs it over every spec.
