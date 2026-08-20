# Docs

`packages/app/content/docs` plus the hand-written markdown at the repo root, in each package, and in `.agents/` —
read against the `docs` skill, `readme-standards` for the READMEs, `skill-authoring` for `.agents/skills`. The
diagram-mandate verdict is recorded per page inside the row's pass, never per area.

| Unit                                                           | Swept      | Notes                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture/*.md`                                            | 2026-08-19 | link text normalised to prose, tombstones inverted, two restating Notes sections cut; the link-text, mermaid-break and Notes rules now live in the `docs` skill                                                                                                                                                                    |
| `platform/*.md`                                                | 2026-08-19 | link text; tombstones inverted across a dozen pages, including a scheduled-sweep rationale reframed as the alternative rather than our history; an agent-only db:gen instruction removed from the roadmap                                                                                                                          |
| `esbabbler/*.md`, `esbabbler/calls/`                           | 2026-08-20 | tombstones inverted (the two emoji libraries, the Storage Queue, `v-intersect`, the PiP activation bug); restating Notes bullets cut from four pages; presence gained the diagram it owed; the call maps' undecided reconciliation moved to a deferred page                                                                        |
| `virrun/*.md`                                                  | 2026-08-20 | the win32 mirror's whole "why it exists" was a log of our own fixes — rewritten as the rule it leaves (the 9p bridge is crossed a bounded number of times per run, never once per file); the worktree-ghost story told on four pages now told once, on the rule's own page; bench figures dropped for the artifacts that hold them |
| `sheet-editor/`, `infra/`                                      | 2026-08-20 | two pages renamed onto what they describe rather than the migration that produced them; the dead-letter page's operator remediation was cross-referenced twice and stated nowhere, so it is now written; bare /docs routes given prose link text                                                                                   |
| `clicker/`, `dungeons/`, `posts/`                              | 2026-08-20 | split from `users/` to fit a review window. Two pages owed a diagram and had none — likes (three procedures, one transaction, an optimistic store) and dungeons saves (two load paths, a manual save, the achievement trigger)                                                                                                     |
| `users/`                                                       | 2026-08-20 | a roadmap logging what shipped instead of holding open work, and three notes recording that a change needed no migration — the standing fact each was carrying is now stated on its own                                                                                                                                            |
| `vue-phaserjs/`, `achievements/`, `fluid-simulator/`, `anime/` | 2026-08-20 | the two exhaustive component inventories on the vue-phaserjs index replaced by the command that answers them; a shipped-changelog section cut. The pass found the escaped-line-break defect and it is now enforced, so grep 8 is retired                                                                                           |
| every `deferred/` and `rejected/` page, every `roadmap.md`     | 2026-08-20 | diagram-exempt — read for revisit triggers and re-argued decisions, and both held. Three roadmaps were logging what shipped under a "no open work" line, which is the one thing a roadmap must not do                                                                                                                              |
| `proposals/`, `docs/index.md`, every area `index.md`           | 2026-08-20 | the drift this row was opened for did not exist — all 40 index pages list every page beside them, and `content/docs/index.test.ts` now holds that, so the concern is enforced rather than re-read                                                                                                                                  |
| root — `AGENTS.md`, `README.md`, `SCORE.md`, `CONTRIBUTING.md` | 2026-08-20 | plus `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.agents/*.md`. CONTRIBUTING was telling contributors a wrong node version, a wrong lint scope and a `db:up` that applies nothing; the package inventory it half-copied now links the one in the README, and `readme-standards` says why two lists exist                                 |
| `packages/*/README.md`                                         | 2026-08-20 | `readme-standards` owns the shape, and every one of them held it — what had drifted is the content a reader would act on: two stale node/pnpm versions, a peer that is not a peer, an eslintrc example for a flat-config repo, a CLI subcommand that does not exist and eleven camelCase function names                            |
| `.agents/skills/*/SKILL.md`                                    | 2026-08-20 | one citation form settled and swept — a docs page is cited by its repo-relative path, not a relative link, a GitHub url or a /docs route; five one-off war stories rewritten as their rule; the wrong `.agents/skills` symlink claim corrected to `.claude` → `.agents`. The citation rule now lives in `skill-authoring`          |
| `.agents/skills/*/SKILL.md` over the ~15 KB budget             | —          | nine of them are, against the budget `skill-authoring` states — the fix is moving sections into `references/`, which is a pass of its own                                                                                                                                                                                          |
| `.agents/skills/*/references/*.md`                             | 2026-08-20 | every page is still indexed by its SKILL.md, and every repo path cited in one resolves. The citation rule settled last window had only reached the SKILL.md files — five pages still cited a docs page by its /docs route, which resolves nowhere from a skill                                                                     |

Greps, over `*.md`. Each finds a candidate, not a defect — the failures are prose-shaped and the pass is reading.
What each pattern means is the owning skill's to say:

1. `\b\d+ (files|packages|pages|components|stores|routers|tests|rows|procedures)\b`
2. `(used to|previously|no longer|formerly|was replaced|has been replaced|we now|renamed from|the old )`
3. `(deprecated|moved to|see instead|superseded by)`
4. `\]\([^)]*\.md[)#]`, and `\[/docs/[^]]*\]\(` for link text repeating its own route
5. `^::`
6. ` ```(typescript|javascript|shell|yml)`
7. `mermaid` absent from a page whose prose names three parts and what passes between them
8. a `## Notes` bullet whose claim already appears in a section above it

Excluded: `CHANGELOG.md` (lerna output) · `CLAUDE.md`, `GEMINI.md` (symlinks to `AGENTS.md`) · `public/docs/api` (TypeDoc
output) · `~/.claude/plugins` skills (external, not ours to edit).

Enforceable next. What is already enforced sits with what it guards: the link, index-coverage,
Key Files and both label-line-break checks in `content/docs/index.test.ts`, the sidebar map beside itself in
`DocsSectionGroupsMap.test.ts`, the docs path segment beside the collection that reads it in
`content.config.test.ts`, and prose restating a node or pnpm version in
`content/getToolchainVersionRestatements.test.ts`. Greps 4, 5 and 6 are exact and decide themselves — but the link-text half of 4 can only land
once every row is swept, since an unswept area still holds instances that would fail the build. Grep 1 needs an
allowlist for the counts that may be exact (package count, configured limits) first. The label-line-break checks
reach the skill tree too, since the diagram list it runs over already spans both; the rest do not, and
`content/docs/index.test.ts` reads nothing else under `.agents/`.
