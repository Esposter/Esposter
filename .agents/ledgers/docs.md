# Docs

`packages/app/content/docs` plus the hand-written markdown at the repo root, in each package, and in `.agents/` —
read against the `docs` skill, `readme-standards` for the READMEs, `skill-authoring` for `.agents/skills`. The
diagram-mandate verdict is recorded per page inside the row's pass, never per area.

| Unit                                                           | Swept      | Notes                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture/*.md`                                            | 2026-08-19 | link text normalised to prose, tombstones inverted, two restating Notes sections cut; the link-text, mermaid-break and Notes rules now live in the `docs` skill                                                                                                                                                           |
| `platform/*.md`                                                | 2026-08-19 | link text; tombstones inverted across a dozen pages, including a scheduled-sweep rationale reframed as the alternative rather than our history; an agent-only db:gen instruction removed from the roadmap                                                                                                                 |
| `esbabbler/*.md`, `esbabbler/calls/`                           | 2026-08-20 | tombstones inverted (the two emoji libraries, the Storage Queue, `v-intersect`, the PiP activation bug); restating Notes bullets cut from four pages; presence gained the diagram it owed; the call maps' undecided reconciliation moved to a deferred page                                                               |
| `virrun/*.md`                                                  | —          |                                                                                                                                                                                                                                                                                                                           |
| `sheet-editor/`, `infra/`                                      | —          |                                                                                                                                                                                                                                                                                                                           |
| `clicker/`, `dungeons/`, `posts/`, `users/`                    | —          |                                                                                                                                                                                                                                                                                                                           |
| `vue-phaserjs/`, `achievements/`, `fluid-simulator/`, `anime/` | —          |                                                                                                                                                                                                                                                                                                                           |
| every `deferred/` and `rejected/` page, every `roadmap.md`     | —          | diagram-exempt — read for revisit triggers and re-argued decisions                                                                                                                                                                                                                                                        |
| `proposals/`, `docs/index.md`, every area `index.md`           | —          | index tables drift against the pages they list                                                                                                                                                                                                                                                                            |
| root — `AGENTS.md`, `README.md`, `SCORE.md`, `CONTRIBUTING.md` | —          | plus `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.agents/*.md`                                                                                                                                                                                                                                                                  |
| `packages/*/README.md`                                         | —          | `readme-standards` owns the shape                                                                                                                                                                                                                                                                                         |
| `.agents/skills/*/SKILL.md`                                    | 2026-08-20 | one citation form settled and swept — a docs page is cited by its repo-relative path, not a relative link, a GitHub url or a /docs route; five one-off war stories rewritten as their rule; the wrong `.agents/skills` symlink claim corrected to `.claude` → `.agents`. The citation rule now lives in `skill-authoring` |
| `.agents/skills/*/SKILL.md` over the ~15 KB budget             | —          | nine of them are, against the budget `skill-authoring` states — the fix is moving sections into `references/`, which is a pass of its own                                                                                                                                                                                 |
| `.agents/skills/*/references/*.md`                             | —          | same rules, plus the SKILL.md that points at each one still describing what it holds                                                                                                                                                                                                                                      |

Greps, over `*.md`. Each finds a candidate, not a defect — the failures are prose-shaped and the pass is reading.
What each pattern means is the owning skill's to say:

1. `\b\d+ (files|packages|pages|components|stores|routers|tests|rows|procedures)\b`
2. `(used to|previously|no longer|formerly|was replaced|has been replaced|we now|renamed from|the old )`
3. `(deprecated|moved to|see instead|superseded by)`
4. `\]\([^)]*\.md[)#]`, and `\[/docs/[^]]*\]\(` for link text repeating its own route
5. `^::`
6. ` ```(typescript|javascript|shell|yml)`
7. `mermaid` absent from a page whose prose names three parts and what passes between them
8. a literal backslash-n inside a mermaid label
9. a `## Notes` bullet whose claim already appears in a section above it

Excluded: `CHANGELOG.md` (lerna output) · `CLAUDE.md`, `GEMINI.md` (symlinks to `AGENTS.md`) · `public/docs/api` (TypeDoc
output) · `~/.claude/plugins` skills (external, not ours to edit).

Enforceable next, all in `content/docs.test.ts` where the link, Key Files and mermaid checks already live. Greps
4, 5, 6 and 8 are exact and decide themselves — but the link-text half of 4 can only land once every row is
swept, since an unswept area still holds instances that would fail the build. Grep 1 needs an allowlist for the
counts that may be exact (package count, configured limits) first. None of these reach `.agents/`, which
`content/docs.test.ts` does not read; an enforcer there would be a second test alongside it.
