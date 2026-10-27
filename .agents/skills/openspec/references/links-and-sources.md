# Links and Sources

Read when a page links another page, or records a decision taken from outside the repo. The one-line rules are in `SKILL.md`; this page is their full statement.

## Links

- **Every line earns its place.** If another page already says it, link instead, by a path relative to the linking page, so the link works on GitHub and in any checkout: from `specs/post/likes/design.md`, the resource standard is `../../architecture/resource/design.md`. The link **text** is prose naming the page, never the path repeated (`[resources](../../architecture/resource/design.md)`): a path reads as punctuation mid-sentence, and the reader already sees where it goes on hover. `scripts/src/workspace/openspecLinks.test.ts` fails on a relative link under `openspec/` that resolves nowhere.
- **Outside `openspec/`**, a README or a manifest links a spec by its GitHub URL (`https://github.com/Esposter/Esposter/blob/main/openspec/...`), since an npm page or a plugin listing resolves no relative path; a skill cites it by its repo path in backticks, which the citation test resolves.

## Sources

- **A decision taken from outside the repo cites where it came from**, as a bullet in the design's `## Sources`: the link, its publisher, and one clause on what it grounds here — the ground truth a reader checks the decision against. A source is opened and read before it is cited, never recalled, since a misremembered spec is worse than none; one that renders nothing a reader can read (a client-side-only page) is swapped for one that does. References every surface shares live on the design sources page (`openspec/specs/architecture/design-sources/design.md`), and a page lists only what its own decisions draw on.
- **A requirement's citations move to the design, and the requirement keeps only the behaviour.** Each removed citation is one bullet under the design's `## Sources`, carrying its path and line references verbatim and one clause naming the requirement it grounds by header. Repo code paths go to `## Key files` instead. Scenarios move theirs too: their GIVEN, WHEN, THEN and AND lines carry the behaviour, and the bullet names the scenario by its title. Nothing is paraphrased or dropped in the move: a citation that disappears from the design is a source lost.
