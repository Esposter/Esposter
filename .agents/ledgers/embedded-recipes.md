# Embedded recipes

Every fence in a skill page, a ledger or a spec that holds a **runnable recipe** rather than an
illustrative code example, read against `skill-authoring`'s `references/embedded-recipes.md`: one command whose
logic is its pattern stays where it is, anything with control flow becomes a tested script under
`scripts/src/<domain>/<verb>/` wired as `pnpm ai:<domain>:<verb>`.

A code example teaching a convention is not a recipe and never migrates — the question is whether a reader is
meant to **run** the block.

| Unit                                                                                                                                                                                                                    | Notes |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `.agents/skills/absent-values`, `…/backfills`, `…/bench`, `…/build`, `…/building-proposals`, `…/claude-mods`, `…/claude-permissions`, `…/cli`                                                                           |       |
| `.agents/skills/code-review`, `…/context-efficiency`, `…/dependency-absorption`, `…/dependency-updates`                                                                                                                 |       |
| `.agents/skills/drizzle`, `…/error-handling`, `…/esbabbler`                                                                                                                                                             |       |
| `.agents/skills/esbabbler-call`, `…/fallacies`, `…/file-organization`, `…/finishing`, `…/formatting`                                                                                                                    |       |
| `.agents/skills/genshin-data`, `…/genshin-engine`                                                                                                                                                                       |       |
| `.agents/skills/genshin-parity`, `…/genshin-text`, `…/git`, `…/github-actions`                                                                                                                                          |       |
| `.agents/skills/invariants`, `…/llm-delegation`, `…/naming`, `…/no-compatibility-debt`                                                                                                                                  |       |
| `.agents/skills/openspec`, `…/over-engineering`, `…/oxlint`, `…/package-scripts`, `…/page-builder`                                                                                                                      |       |
| `.agents/skills/pagination`, `…/pinia`, `…/product-review`, `…/pulumi-infra`, `…/readme-standards`                                                                                                                      |       |
| `.agents/skills/recreation-tooling`, `…/responsive`, `…/resuming`, `…/reverse-engineering`, `…/review-queue`, `…/routing`, `…/run-app`, `…/running-checks`, `…/runtime-efficiency`, `…/score`, `…/security`, `…/settle` |       |
| `.agents/skills/skill-authoring`, `…/skill-sweep`, `…/slash-commands`, `…/string-utils`, `…/styling`                                                                                                                    |       |
| `.agents/skills/sweeps`, `…/test-values`                                                                                                                                                                                |       |
| `.agents/skills/testing`, `…/throughput`, `…/tiptap`, `…/todos`                                                                                                                                                         |       |
| `.agents/skills/trpc`, `…/typescript`                                                                                                                                                                                   |       |
| `.agents/skills/ui-library`, `…/unocss`, `…/ux`                                                                                                                                                                         |       |
| `.agents/skills/vue`, `…/vue-component-patterns`, `…/vue-composable-patterns`                                                                                                                                           |       |
| `.agents/skills/vue-page-composition`, `…/vue-phaserjs`, `…/vuetify0`, `…/zod`                                                                                                                                          |       |
| `.agents/ledgers` — its own files                                                                                                                                                                                       |       |
| `.agents/ledgers/docs`, `…/file-organization`, `…/invariants`, `…/naming`                                                                                                                                               |       |
| `.agents/ledgers/quality`, `…/security`, `…/test-values`                                                                                                                                                                |       |
| `.agents/ledgers/testing`, `…/typescript`, `…/write-once`                                                                                                                                                               |       |
| root markdown                                                                                                                                                                                                           |       |
| `openspec/**/*.md`                                                                                                                                                                                                      |       |

Find recipe, over `*.md`: fenced `bash`/`sh` blocks are the candidates, and a block is a finding when it holds a
loop, a branch, a fallback or a second process aggregating the first's output.

````bash
grep -rn -A 30 '^```bash' --include=*.md .agents openspec *.md |
  grep -E "^\S+[-:][0-9]+[-:]\s*((for |while |until ).*(; do| do$)|if .*; then)"
````

Each hit is a candidate, not a defect: the pass reads the block and decides whether its logic is its pattern.
Prose inside the trailing window still slips through, and a placeholder shape taught as an idiom is not a
recipe, so a hit is read rather than counted.
