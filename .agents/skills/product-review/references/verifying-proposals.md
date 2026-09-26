# Verifying Proposals

Read when double-checking the open proposals of an area — which every pass does, whether or not it adds any.

An open proposal is a promise that a cold session can build it as written. Code moves under it, so each pass checks four things per proposal, in this order:

1. **Still unbuilt.** Grep the code for what the proposal adds — its new field, procedure, component or enum member. Built and not rewritten means the ship lifecycle was skipped: rewrite it as the as-built page, delete the proposal and its roadmap line (`docs`).
2. **Still consistent.** Every existing file its Key Files table names still exists and still plays the role described; every mechanism it builds on (a store's write path, a map, a capability) still works the way it says. A proposal describing a seam that has since changed is revised in the same pass, and its `model` updated to the reviser.
3. **Still wanted.** Nothing shipped since has made it redundant, and nothing in `deferred/` or `rejected/` now contradicts it. Superseded is a rejected page naming what superseded it, never a silent delete.
4. **Sources still resolve.** Each link in `## Sources` opens and still says what the bullet claims.

A proposal that passes all four is left untouched — rewording one that is still correct is churn with no finding behind it. The pass's report lists the proposals checked and the verdict for each, "holds" included.
