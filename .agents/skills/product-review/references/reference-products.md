# Reference Products

Read when an area has no reference product yet, or two products compete for the role.

The reference product is the one shipped product that already solved the domain, whose arrangement, wording and interaction a surface takes rather than reinvents (`ux` skill; the table is `apps/web/content/docs/architecture/design-sources.md`). A product review without one judges a surface against taste, which never converges: every pass finds a different taste.

## Picking one

- **The product people name when they describe the domain**, not the one with the most features: Microsoft To Do for a todo list, Google Forms for survey responses, Notion for a document, draw.io for a flowchart, Discord for chat. Its feature list is the ceiling, never the target.
- **One per surface, not per area** when an area holds several domains. The resource area has one for its shell (the Azure portal) and one per type, because a todo list and a spreadsheet are not solved by the same product.
- **A standard beats a product where one exists** — ISO 5807 for flowchart symbols, WAI-ARIA for a keyboard contract — since a standard does not change with a release.
- **A second product is consulted only for what the first lacks**, and named as the source of that part alone, as the calendar takes its views from Outlook and its single-key shortcuts from Google Calendar.

## Where the pick is recorded

Until something ships, the pick lives in the proposal's `## Sources`, one bullet per page read and the part taken from it (`docs`, `references/links-and-sources.md`). When the surface ships, the design sources table gains the area's row in the same change — that page lists only what a shipped surface took.

## Reading it

A product's own help centre is the source, since it states behaviour in words that can be quoted and cited. A marketing page or a client-rendered app shell that returns nothing readable is swapped for the help article saying the same thing. Where the help centre is silent on a detail — the exact animation, the exact empty state — the proposal says it is our design, not the reference's.
