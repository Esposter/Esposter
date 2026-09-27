# Choosing What To Build

Read when asked what to build next or for the low-hanging fruit, when reading `pnpm ai:proposals:report`, or when the next unit is a folder of sub-specs or a ready-for-agent issue.

## The report

`pnpm ai:proposals:report` reads every open proposal and prints one line each, cheapest first:

- **Files** — the rows of its Key files table, which lists the existing files the work touches (`docs`, `references/page-shapes.md`). A proposal with no table prints **unsized** and sorts last: nothing can be read off it, and a product-review pass owes it the table (`product-review`, `references/verifying-proposals.md`).
- **Signals** — the costs past the files themselves, each read off a Key files path: `server` (a procedure or server service), `schema` (a migration), `azure` (a Function or infrastructure deploy), `dependency` (a manifest, so a package argued through dependency admission).
- **after** — the open proposals its lead paragraph links, which have to ship first. A folder's own index is its umbrella, never a blocker.

Then one line per area owed a product-review pass (`references/shipping.md`).

The order is a cost order, never a priority. It is right about the effort and blind to the value, so it is the first half of the choice and never the whole of it.

## Weighing it

Value is read from the roadmap of the proposal's area, whose order is the area's priority, and from the proposal's own lead, which states the gap it closes. Among the cheap, take first:

1. **The gap that stops a person finishing the job the domain exists for** — the first question of `product-review`'s inventory (`references/gap-inventory.md`); a todo list that can only delete outranks a nicer sort.
2. **What unblocks the most** — a proposal other proposals list as `after`, so one build turns several lines of the report buildable.
3. **What pairs with the pick before it** — two proposals over the same files, taken back to back, so the second's reading is already done — an editor's new node before its export, whose round-trip test then covers the node.

An `unsized` proposal is sized before it is chosen — its Key files table is written first, from the code, which is a correction to the proposal and not a build.

## A folder of sub-specs

A proposal folder's `index.md` holds the build order; each sub-spec is one build, taken in that order, and a sub-spec that must wait says so in its lead so the report lists it `after` its prerequisite (`docs`, `references/page-shapes.md`). The folder ships one sub-spec at a time, each with its own as-built increment, and the index goes when the last sub-spec does.

## Refactor plans

A plan under `proposals/refactors/` is chosen and built like any proposal — the report lists it with the rest — and ships as a one-time change, which leaves a shipped-log line and no feature page (`docs`, `references/page-shapes.md`, "Lifecycle map"). A plan split into phases is built one phase at a time, in its own order.

## A ready-for-agent issue

An issue labelled `ready-for-agent` (`.agents/triage-labels.md`) is a spec the tracker holds instead of the docs tree. It is taken like a proposal — re-verified, built, shipped — and closed on ship (`references/shipping.md`). An issue that turns out to need a design decision is not built from the issue: it becomes a proposal first, through the area's product-review triage.

## Saying what was chosen

The pick opens with the report line it came from, the value that decided it over the lines above it, and the verification verdict (`references/building.md`), so the choice can be checked before any code is written.
