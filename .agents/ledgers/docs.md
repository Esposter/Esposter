# Docs

`packages/app/content/docs` plus the hand-written markdown at the repo root and in each package, read against the
`docs` skill (`readme-standards` for the READMEs). The diagram-mandate verdict is recorded per page inside the
row's pass, never per area.

| Unit                                                           | Swept      | Notes                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture/*.md`                                            | 2026-08-19 | link text normalised to prose, tombstones inverted, two restating Notes sections cut; the link-text, mermaid-break and Notes rules now live in the `docs` skill                                           |
| `platform/*.md`                                                | 2026-08-19 | link text; tombstones inverted across a dozen pages, including a scheduled-sweep rationale reframed as the alternative rather than our history; an agent-only db:gen instruction removed from the roadmap |
| `esbabbler/*.md`, `esbabbler/calls/`                           | —          |                                                                                                                                                                                                           |
| `virrun/*.md`                                                  | —          |                                                                                                                                                                                                           |
| `sheet-editor/`, `infra/`                                      | —          |                                                                                                                                                                                                           |
| `clicker/`, `dungeons/`, `posts/`, `users/`                    | —          |                                                                                                                                                                                                           |
| `vue-phaserjs/`, `achievements/`, `fluid-simulator/`, `anime/` | —          |                                                                                                                                                                                                           |
| every `deferred/` and `rejected/` page, every `roadmap.md`     | —          | diagram-exempt — read for revisit triggers and re-argued decisions                                                                                                                                        |
| `proposals/`, `docs/index.md`, every area `index.md`           | —          | index tables drift against the pages they list                                                                                                                                                            |
| root — `AGENTS.md`, `README.md`, `SCORE.md`, `CONTRIBUTING.md` | —          | plus `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.agents/*.md`                                                                                                                                                  |
| `packages/*/README.md`                                         | —          | `readme-standards` owns the shape                                                                                                                                                                         |

Greps, over `*.md`. Each finds a candidate, not a defect — the failures are prose-shaped and the pass is reading:

1. `\b\d+ (files|packages|pages|components|stores|routers|tests|rows|procedures)\b` — a count the repo can answer
2. `(used to|previously|no longer|formerly|was replaced|has been replaced|we now|renamed from|the old )` — history narrated as a rule; invert it rather than deleting it
3. `(deprecated|moved to|see instead|superseded by)` — tombstone stubs the skill bans outright
4. `\]\([^)]*\.md[)#]` — links must be app routes without the suffix
5. `^::` — MDC syntax, which the renderer has no components for
6. ` ```(typescript|javascript|shell|yml)` — long-form fence names; one language, one spelling
7. `mermaid` absent from a page whose prose names three parts and what passes between them
8. `
` inside a mermaid label — parses clean, renders the two characters (`<br/>` is the break)
9. a `## Notes` bullet whose claim already appears in a section above it

Excluded: `CHANGELOG.md` (lerna output) · `CLAUDE.md`, `GEMINI.md` (symlinks to `AGENTS.md`) · `public/docs/api` (TypeDoc
output) · `~/.claude/plugins` skills (external, not ours to edit).

Enforceable next, all in `content/docs.test.ts` where the link, Key Files and mermaid checks already live: greps 4,
5 and 6 are exact and decide themselves; grep 1 needs an allowlist for the counts that may be exact (package
count, configured limits) before it can fail a build.
