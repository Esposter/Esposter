# Building One

Read before the first edit of a build, when a feature is asked for with no proposal behind it, and when the spec turns out to be wrong halfway through.

## Before the first edit

Run the checks of `product-review`'s `references/verifying-proposals.md` on this one page — still unbuilt, consistent, wanted, sourced and sizeable. A proposal that fails one is corrected first, in its own commit, and a proposal that is no longer wanted becomes a rejected page naming what superseded it; neither is built.

Then read the files its Key files table names in full, and one hop out of each load-bearing one — the build is the first reader since the spec was written, and the spec's claims about those files are claims until they are opened.

## When the spec is wrong

A build learns things the design could not. What happens to the spec depends on who the answer changes:

- **An implementation detail the spec over-specified** — a helper's name, a file split, a component boundary — is built the better way; the as-built page describes what was built, and the proposal is deleted with the ship as usual.
- **A decision the spec made** — the data model, the behaviour a person sees, what is left out — that the code proves wrong is revised in the proposal first, with its `model` updated to the reviser (the `docs` skill, `references/page-frontmatter.md`), and the build continues against the revision. A change of what the product does is the user's to hear about before it ships.
- **A spec that cannot be built as a whole** — a seam it assumes does not exist — stops the build. What was learned goes into the proposal, and the pick goes back to the report.

## A feature asked for with no proposal

A direct ask is its own spec, and writing a proposal first would be ceremony. What the proposal would have carried is still checked before building:

- **The written record.** The area's `deferred/` and `rejected/` indexes — a decided idea is raised with the user, never built over quietly (the `code-review` skill, `references/written-record.md`).
- **The reference product.** The area's row in `apps/web/content/docs/architecture/design-sources.md`, read for the same screen, so a direct build matches the product the area is judged against (the `product-review` skill, `references/reference-products.md`).
- **The open proposals.** An ask a proposal already designs is built from the proposal.

## What the build leaves out

A build takes the lean core of what it was asked, the same as a pass does (the `product-review` skill, "Taking the reference product whole"). Every larger part it knowingly leaves out is written as a deferred or rejected page in the same change, so the next pass reads it as decided instead of finding it as a gap.

## Commits

One coherent chunk per commit, by pathspec, pushed per the `review-queue` skill; a folder's sub-specs are separate builds and separate commits. A file the build touches inside a unit a ledger still lists as unswept is swept first, in its own commit (the `sweeps` skill, `references/draining.md`).
