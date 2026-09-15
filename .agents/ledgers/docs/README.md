# Docs

`apps/web/content/docs` plus the hand-written markdown at the repo root, in each package, and in `.agents/` —
read against the `docs` skill, `readme-standards` for the READMEs, `skill-authoring` for `.agents/skills`. The
diagram-mandate verdict is recorded per page inside the row's pass, never per area. The skill tree is one
subject and has one ledger: its rows are here, and reading a skill for duplication and for prose that does not
earn its line is the same read against the same owner.

Two questions per unit: the mandate's, of every page with no diagram, and `references/diagrams.md`'s, of every
page that has one.

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping.

| Area                  | What it holds                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------- |
| [content](content.md) | `apps/web/content/docs`, the root markdown, every package README                            |
| [skills](skills.md)   | `.agents/skills` — one skill per row, its `SKILL.md` and its `references/` read as one unit |

Greps, over `*.md`. Each finds a candidate, not a defect — the failures are prose-shaped and the pass is reading.
What each pattern means is the owning skill's to say:

1. `\b\d+ (files|packages|pages|components|stores|routers|tests|rows|procedures)\b` for what the repo can
   count, and `\b\d+(\.\d+)? ?(ms|s|kb|mb|gb|seconds|minutes)\b` for the profiling figures and byte sizes the
   same rule reaches — a stopwatch reading drifts with the hardware that took it, where a magnitude does not
2. `(used to|previously|no longer|formerly|was replaced|has been replaced|we now|renamed from|the old )`
3. `(deprecated|moved to|see instead|superseded by)`
4. `\]\([^)]*\.md[)#]`, and `\[/docs/[^]]*\]\(` for link text repeating its own route
5. `^::`
6. ` ```(typescript|javascript|shell|yml)`
7. `mermaid` absent from a page whose prose names three parts and what passes between them
8. a `## Notes` bullet whose claim already appears in a section above it
9. a page that **has** a diagram — the inverse of 7, read against `docs`, `references/diagrams.md`. Its label
   half is enforced (below), so what a pass looks for is the shape: a diagram that is a catalog, an inventory or
   a straight line. None of the three has a form a pattern can see — the tells are a node whose label is an
   entity's attributes, a subgraph nothing reads in a direction, and a chain whose order is the sentence above it

The skill tree adds a structural check the greps cannot make — a skill over budget, a reference page nothing
indexes, one whose first paragraph does not open `Read …`, a `## Settled` list that is not its skill's first
section, a `references/` citation resolving nowhere.

```bash
pnpm ai:sweep:skill-docs
```

It lives in `scripts/src/sweeps/skillDocs/` rather than in this file, because it is a program: six checks over the
whole tree, one of which has to decide when **not** to resolve a pointer. It was a `python3` heredoc, which on a
Windows checkout prints a Microsoft Store notice and exits 0 — no findings, no error, indistinguishable from a
clean tree (`sweeps`, `references/find-recipes.md`).

An `unresolved` hit is a pointer nothing resolves, and nothing fails a build on one. A citation from inside
`references/` to a file at its own skill's root is the recurring shape, and it needs `../`. The one line the
check cannot judge is `skill-authoring`'s `references/x.md` placeholder.

Excluded: `CHANGELOG.md` (lerna output) · `CLAUDE.md`, `GEMINI.md` (symlinks to `AGENTS.md`) · `public/docs/api` (TypeDoc
output) · `~/.claude/plugins` skills (external, not ours to edit).

Enforceable next. What is already enforced sits with what it guards: the link, index-coverage,
Key Files, the label-size cap and both label-line-break checks in `content/docs/index.test.ts`, the sidebar map beside itself in
`DocsSectionGroupsMap.test.ts`, the docs path segment beside the collection that reads it in
`content.config.test.ts`, and prose restating a node or pnpm version in
`content/getToolchainVersionRestatements.test.ts`. Greps 4, 5 and 6 are exact and decide themselves — but the link-text half of 4 can only land
once every row is swept, since an unswept area still holds instances that would fail the build. Grep 1 needs an
allowlist for the counts that may be exact (package count, configured limits) first. The label-line-break checks
reach the skill tree too, since the diagram list it runs over already spans both; the rest do not, and
`content/docs/index.test.ts` reads nothing else under `.agents/`.
