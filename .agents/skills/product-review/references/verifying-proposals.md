# Verifying Proposals

Read when double-checking the open proposals of an area — which every pass does, whether or not it adds any — and before a build takes one up (`building-proposals`, `references/building.md`).

An open proposal is a promise that a cold session can build it as written. Code moves under it, so each check below is run per proposal, in this order:

1. **Still unbuilt.** Grep the code for what the proposal adds — its new field, procedure, component or enum member. Built and not rewritten means the ship lifecycle was skipped: rewrite it as the as-built page, delete the proposal and its roadmap line (the `docs` skill, `references/page-shapes.md`).
2. **Still consistent.** Every existing file its Key Files table names still exists and still plays the role described; every mechanism it builds on (a store's write path, a map, a capability) still works the way it says. A proposal describing a seam that has since changed is revised in the same pass, and its `model` updated to the reviser.
3. **Still wanted.** Nothing shipped since has made it redundant, and nothing in `deferred/` or `rejected/` now contradicts it. Superseded is a rejected page naming what superseded it, never a silent delete.
4. **Sources still resolve.** Each link in `## Sources` opens and still says what the bullet claims.
5. **Still sizeable.** It has a Key files table, a package it adds is its manifest's row there, and a proposal it must wait on is linked in its lead (`docs`, `references/page-shapes.md`) — which is everything `pnpm ai:proposals:report` reads, so a proposal the report prints as `unsized` fails here. The table follows the data from where it is written to everywhere it is drawn, so the sanitizer at a render boundary and the shared stylesheet are rows when the change reaches them. A table that is short of a file makes the proposal look cheaper than it is, and the build is the first to find out.

A proposal that passes every check is left untouched — rewording one that is still correct is churn with no finding behind it. The pass's report lists the proposals checked and the verdict for each, "holds" included.
