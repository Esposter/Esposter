# Write once

The question is the write-once design's: does a declaration, or a list kept by hand, restate what the code already says, so that the code could be read instead? The rule and its red flags are `openspec/specs/architecture/write-once/design.md`. The hand-kept list is the `over-engineering` skill's shape ("A list kept by hand beside what the code already declares"), and a copy a test holds equal is the case most often found.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status write-once` says where each unit stands. It holds a note on no unit, so it keeps no area file of its own. A pass loads this file and the area's file in the list.

## The find recipe

Run from the repository root, since a claim that a copy has no other holder read from a subdirectory answers for that directory alone. A hit is a candidate, not a defect: it is either a copy to remove, or one an outside reader must keep (the carve-outs below).

```bash
git grep -n -E '^[[:space:]]*const [A-Z][A-Z0-9_]+ = \[' -- '*.test.ts' '*.test-d.ts'
git grep -n -i -E 'held (equal|in step)|keeps? .* (equal|in step)|only thing holding|copies? of' -- '*.ts' '*.vue' '*.md' ':!*CHANGELOG.md'
git grep -n -E '(^|[^A-Za-z0-9_])(ALLOW|EXEMPT|EXCEPT|SKIP)[A-Z_]*([^A-Za-z0-9_]|$)' -- apps packages scripts
```

The first lists the hand-kept lists a test holds, the second the prose that names a copy a check keeps equal, and the third an allowlist. Each is a pattern, not a scan: a list whose exceptions are the drift is a roster the enforcement ladder keeps off the lint rung.

## Exclusions

- **Generated output.** `apps/web/shared/generated` and the other generated folders are their generator's copy, and the generator is what changes them.
- **Generated changelogs.** `CHANGELOG.md` is lerna output, written by the release, so no copy in it is ours to keep equal.
- **Literal values in a test.** The `test-values` ledger owns the literals a test writes. This ledger reads a test only for a copy it holds.

## Carve-outs

A copy an outside reader must hold is not removed. Each keeps the test that holds it equal to its source, as the enforcer:

- **GitHub workflows** cannot read TypeScript, so the cache path in `CI.yaml` and `build-packages.yaml` is spelled out (`pathLiterals.test.ts`).
- **The disk-scan mod** ships without `@esposter/shared`, so its refusal spells the parity folder under the data root itself (same test).
- **lerna-lite** reads only `lerna.json`, so its workspace globs repeat `pnpm-workspace.yaml` (`lernaPackages.test.ts`).
- **Configs loaded outside the import map** — `.gitignore` and the oxlint config repeat the agent directories (`agentDirectories.test.ts`).
- **pnpm's and npm's vocabulary** — their command names and dependency fields (`packageScripts.test.ts`, `publishedDependencies.test.ts`).
- **Manifest placement** that pnpm and npm read, held to what the sources import (`typeOnlyDependencies.test.ts`, `peerDependencies.test.ts`).
- **Committed records** held to a fresh build — `bundle-sizes.md` and the `*.bench.md` reports (`bundleSizes.test.ts`, `benchArtifacts.test.ts`).
- **Judgement lists**, where the words are the decision and not a copy: the noise keywords, the counted nouns, and the superseded-package map, which npm does not mark (`packageKeywords.test.ts`, `preciseCounts.test.ts`, `supersededPackages.test.ts`).
- **Detectors** of restated copies enforce this rule rather than restate it: `restatedGameColours`, `restatedPointers`, `toolchainVersionRestatements`, `duplicateProse` and `duplicateCode`.

## Open findings

Each is a copy the code could be read instead of. Each needs a call, or belongs to another area's pass. Named by the test that holds it, or by the file where no test does:

- `deployedPictures.test.ts` — `UI_AvatarIcon_` is a literal in two `genshinAssets` files and in this test. Export it from `genshinAssets` and import it in all three (`tooling`).
- `packageKeywords.test.ts` — `WORKSPACE_DIRECTORIES` restates the `apps/*` and `packages/*` globs. `readWorkspacePackages` yields the same members, but it types its manifest as `PackageManifest`, which has no `keywords`, `bugs` or `homepage`, so the switch needs that type widened in the shared reader first (`tooling`).
- `requiredChecks.test.ts` — `CI.yaml`'s coverage shard list restates `CoverageShardCount`. The ruleset in `apps/infra` could read the list from the workflow (the `pulumi-infra` skill).
- `genshinExitGates.test.ts` — the progress report carries copies of the phase gate clauses from the `genshin-phases` design. Reading the design at run time binds the report to a folder that archives. Owner call.
- `packageInventories.test.ts` — the member tables in `AGENTS.md` and `README.md` hold each path by hand. Generated tables would drop the copy. Owner call.
- `openspecIndexes.test.ts`, `skillDocs.test.ts` — hand-written indexes held equal to their folders by a test. A generated index, or the prose kept as it is. Owner call.
- `aiScripts.test.ts` — the `package-scripts` catalogue rows are held equal to the root `ai:` scripts. Owner call, as above.
- `ciCaches.test.ts` — the same save condition repeats on every save step. A composite action would state it once (the `github-actions` skill).
- `childProcessImport.test.ts` — the child-process ban is spelled twice in `oxlint/importRestrictions.ts`. One pattern if the rule accepts it (the `oxlint` skill).
- `nuxtModuleNames.test.ts` — `MODULE_NAME` is kept equal to the manifest name, because a runtime file cannot import the manifest. A build-time define could carry the value instead (the `build` skill).
