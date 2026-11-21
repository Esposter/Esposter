# Embedded recipes

Every fence in a skill page, a ledger or a spec that holds a **runnable recipe** rather than an
illustrative code example, read against `skill-authoring`'s `references/embedded-recipes.md`: one command whose
logic is its pattern stays where it is, anything with control flow becomes a tested script under
`scripts/src/<domain>/<verb>/` wired as `pnpm ai:<domain>:<verb>`.

A code example teaching a convention is not a recipe and never migrates — the question is whether a reader is
meant to **run** the block.

| Unit                                                                                                                                                                                                                    | Swept                   | Notes |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----- |
| `.agents/skills/absent-values`, `…/backfills`, `…/bench`, `…/build`, `…/building-proposals`, `…/claude-mods`, `…/claude-permissions`, `…/cli`                                                                           | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/code-review`, `…/context-efficiency`, `…/dependency-absorption`, `…/dependency-updates`                                                                                                                 | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/drizzle`, `…/error-handling`, `…/esbabbler`                                                                                                                                                             | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/esbabbler-call`, `…/fallacies`, `…/file-organization`, `…/finishing`, `…/formatting`                                                                                                                    | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/genshin-data`, `…/genshin-engine`                                                                                                                                                                       | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/genshin-parity`, `…/genshin-text`, `…/git`, `…/github-actions`                                                                                                                                          | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/invariants`, `…/llm-delegation`, `…/naming`, `…/no-compatibility-debt`                                                                                                                                  | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/openspec`, `…/over-engineering`, `…/oxlint`, `…/package-scripts`, `…/page-builder`                                                                                                                      | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/pagination`, `…/pinia`, `…/product-review`, `…/pulumi-infra`, `…/readme-standards`                                                                                                                      | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/recreation-tooling`, `…/responsive`, `…/resuming`, `…/reverse-engineering`, `…/review-queue`, `…/routing`, `…/run-app`, `…/running-checks`, `…/runtime-efficiency`, `…/score`, `…/security`, `…/settle` | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/skill-authoring`, `…/skill-sweep`, `…/slash-commands`, `…/string-utils`, `…/styling`                                                                                                                    | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/sweeps`, `…/test-values`                                                                                                                                                                                | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/testing`, `…/throughput`, `…/tiptap`, `…/todos`                                                                                                                                                         | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/trpc`, `…/typescript`                                                                                                                                                                                   | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/ui-library`, `…/unocss`, `…/ux`                                                                                                                                                                         | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/vue`, `…/vue-component-patterns`, `…/vue-composable-patterns`                                                                                                                                           | 2026-11-22 · Haiku 5.5  |       |
| `.agents/skills/vue-page-composition`, `…/vue-phaserjs`, `…/vuetify0`, `…/zod`                                                                                                                                          | 2026-11-22 · Haiku 5.5  |       |
| `.agents/ledgers` — its own files                                                                                                                                                                                       | 2026-11-22 · Haiku 5.5  |       |
| `.agents/ledgers/docs`, `…/file-organization`, `…/invariants`, `…/naming`                                                                                                                                               | 2026-11-22 · Haiku 5.5  |       |
| `.agents/ledgers/quality`, `…/security`, `…/test-values`                                                                                                                                                                | 2026-11-22 · Haiku 5.5  |       |
| `.agents/ledgers/testing`, `…/typescript`, `…/write-once`                                                                                                                                                               | 2026-11-22 · Haiku 5.5  |       |
| root markdown                                                                                                                                                                                                           | 2026-11-22 · Haiku 5.5  |       |
| `openspec/**/*.md`                                                                                                                                                                                                      | 2026-10-31 · Sonnet 5.5 |       |

Find recipe, over `*.md`: fenced `bash`/`sh` blocks are the candidates, and a block is a finding when it holds a
loop, a branch, a fallback or a second process aggregating the first's output.

````bash
grep -rn -A 30 '^```bash' --include=*.md .agents openspec *.md |
  grep -E "^\S+[-:][0-9]+[-:]\s*((for |while |until ).*(; do| do$)|if .*; then)"
````

Each hit is a candidate, not a defect: the pass reads the block and decides whether its logic is its pattern.
Prose inside the trailing window still slips through, and a placeholder shape taught as an idiom is not a
recipe, so a hit is read rather than counted.
