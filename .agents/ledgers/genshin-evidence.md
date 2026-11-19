# Genshin evidence

One row per spec folder under `openspec/specs/genshin`, derived from the tree by `LedgerUnitsMap`: the folder is the unit, and its `design.md` and `spec.md` are read together.

Find recipe: a folder is open when its design is open, and a design is open when either test holds. A `no source yet` on an unchecked `- [ ]` task line is an open question the task names, and opens nothing.

Test one: a `no source yet` anywhere else in a design.

```bash
git grep -n "no source yet" -- 'openspec/specs/genshin/*/design.md' | grep -vE ':[0-9]+:[[:space:]]*- \[ \] ' | cut -d: -f1 | sort -u
```

Test two: a design with no `## Sources` section and no `genshin-parity/references/` path.

```bash
comm -23 <(git grep -L "^## Sources" -- 'openspec/specs/genshin/*/design.md' | sort) <(git grep -l "genshin-parity/references/" -- 'openspec/specs/genshin/*/design.md' | sort)
```

A pass sweeps the union of both. The spec side has no recipe here: `scripts/src/services/openspec/lintRequirementSources.ts` checks every requirement body, and `readSpecFindings.test.ts` runs it over every spec.

| Unit | Swept | Notes |
| ---- | ----- | ----- |
