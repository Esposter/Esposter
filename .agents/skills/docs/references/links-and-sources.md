# Links and Sources

Read when a page links another page, or records a decision taken from outside the repo. The one-line rules are in `SKILL.md`; this page is their full statement.

## Links

- **Every line earns its place.** If another page already says it, link instead (`/docs/architecture/resource` — absolute route paths, no `.md` suffix, so links work in-app). The link **text** is prose naming the page, never the route repeated (`[resources](/docs/architecture/resource)`): a route reads as punctuation mid-sentence, and the reader already sees where it goes on hover.

## Sources

- **A decision taken from outside the repo cites where it came from**, as a bullet in the page's `## Sources`: the link, its publisher, and one clause on what it grounds here — the ground truth a reader checks the decision against. A source is opened and read before it is cited, never recalled, since a misremembered spec is worse than none; one that renders nothing a reader can read (a client-side-only page) is swapped for one that does. References every surface shares live on the design sources page (`/docs/architecture/design-sources`), and a page lists only what its own decisions draw on.
