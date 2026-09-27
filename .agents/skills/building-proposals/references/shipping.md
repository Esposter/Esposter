# Shipping One

Read when a build is done: what the ship owes beyond the `docs` skill's lifecycle map, the issue it closes, and the product-review pass it hands back.

## The ship is part of the change

What a ship does to the docs tree is the `docs` skill's lifecycle map (`references/page-shapes.md`), and all of it lands in the change that ships the behaviour, never after it. On top of it a build owes:

- **The proposal's sources move onto the feature page**, and a reference product the proposal chose joins the design sources table, since that table lists only what a shipped surface took (`product-review`, `references/reference-products.md`).
- **Every link to the deleted proposal is repointed** — the docs tests fail on a dead link, and a sub-spec that listed it in its lead now links the as-built page, which also takes it off the report's `after`.
- **A proposal whose Key files the build moved** is re-verified in the same change: the `finishing` audit's proposal row asks it of every change, and a build is the change most likely to owe it.
- **A folder's last sub-spec** takes the folder's `index.md` with it.

## An issue closes on ship

A build taken from an issue ends with `gh issue close <n> --comment "<the commit and the page it shipped as>"` once its commit is pushed (`.agents/issue-tracker.md`), so the tracker never lists built work as open.

## Handing the area back

A ship moves the surface the area's last product-review pass judged, which is the first of the triggers that pass's stop rule waits on (`product-review`, `references/convergence.md`). Nothing is written to record it: `pnpm ai:proposals:report` compares the newest proposal deleted from the area with the newest `docs(product-review): <area>` commit and lists the area as owed until a pass names it. The shipping session runs that pass itself, straight after the ship is pushed, with no approval asked: it is the next item on the list of what runs next (`apps/web/content/docs/architecture/engineering-loops.md`), and its commits are pushed like any other.
