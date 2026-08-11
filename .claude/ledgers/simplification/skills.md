# Skills

`.claude/skills` read against `skill-authoring` and the ownership map in `.claude/skills/README.md`. Grouped so each row is one review-sized commit, and so the one-owner-per-topic check happens inside a row rather than across commits.

| Unit                                                                                                                   | Swept | Notes |
| ---------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| `coderabbit`                                                                                                           | —     |       |
| `vue`, `vue-component-patterns`, `vue-page-composition`, `vue-composable-patterns`                                     | —     |       |
| `styling`, `vuetify`, `unocss`, `responsive`                                                                           | —     |       |
| `file-organization`, `formatting`, `error-handling`, `string-utils`                                                    | —     |       |
| `typescript`, `zod`, `naming`                                                                                          | —     |       |
| `testing`, `bench`                                                                                                     | —     |       |
| `pinia`, `pagination`, `routing`                                                                                       | —     |       |
| `trpc`, `drizzle`, `azure-table`, `esbabbler`, `esbabbler-call`                                                        | —     |       |
| `skill-authoring`, `README.md`, `docs`, `readme-standards`, `code-review`, `sweeps`                                    | —     |       |
| `build`, `dependency-updates`, `pulumi-infra`                                                                          | —     |       |
| `oxlint`, `package-scripts`, `context-efficiency`, `model-delegation`, `claude-permissions`, `run-app`, `score`, `git` | —     |       |
| `slash-commands`, `vjsf`, `tiptap`, `grapesjs`, `vue-phaserjs`                                                         | —     |       |

Over budget at the sweep's start (`skill-authoring`: ~15 KB, ~150 lines per `SKILL.md`) — `coderabbit` 28 KB/234, `file-organization` 19 KB, `testing` 19 KB, `styling` 18 KB, `typescript` 18 KB, `vue` 18 KB, `pinia` 17 KB, `vuetify` 17 KB/164, `bench` 15 KB. Under-budget skills are still in scope: a line that restates an enforcer or narrates one change is dead weight at any size.

The find recipe is reading, not grepping — the failures are prose-shaped. What each pass looks for, in `skill-authoring`'s terms: a rule an enforcer already fails the build on, a one-off written as a standing rule, identifiers or numbers lifted from the change that prompted the note, a pointer to a section the reader reaches by reading on, a paragraph re-arguing a rule already stated, a `references/` page nothing indexes by trigger, a topic owned by two skills.

Two checks bracket every pass. Before: the row's skills are read together, so a rule moving to its most specific owner lands in the same commit. After: each edited skill's `description` is re-read against its new body, and any heading cited elsewhere is grepped for — `grep -rn "<heading text>" .claude/skills packages/app/content/docs AGENTS.md` — because nothing resolves a skill link.

Rules may be rewritten, merged, split across the two tiers, or deleted where they no longer hold. A deletion states its reason in the commit message; the ledger tracks coverage.
