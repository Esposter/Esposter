# Gap Inventory

Read when reading a surface to list what it is missing.

## What to read, in order

1. **The area's roadmap, deferred and rejected indexes** — before anything else, so a gap already decided is recognised on sight instead of being rediscovered and re-argued.
2. **The surface's code**: the content schema or table (what can be stored), the store (what can be written, and through which path), and the components (what a person can reach). The feature page says what was true when it was written; the code says what is true.
3. **The feature pages' own hints** — `grep -iE "follow-on|natural sibling|not bundled|yet"` over the area's pages finds the gaps a shipping session already saw and left.
4. **The reference product's help pages** for the same screen.

## The questions every surface is asked

- **Can a person finish the job the domain exists for?** A todo list that can only delete, a flowchart with no arrow, a survey whose answers cannot be counted — the gap that makes the type not yet the thing it is named after comes first.
- **Does everything the editor lets a person do survive a save and a reload?** Draw it, save, reload, compare. A schema that rejects or strips what the editor writes is a defect, fixed in the pass.
- **What does the reference product's main screen show that ours does not**, and of that, what is its lean core versus its ceiling?
- **How does the work get out?** Export, share, print — a type whose content cannot leave except by publishing is a gap.
- **What is dead weight?** A column that says the same thing on every row, an enum with one member, a setting nobody changes — a removal is as much a finding as an addition.
- **Is the first want met at the point of need?** The `ux` skill's reachability rules, applied to each action found.

## Writing it down

Each gap becomes exactly one of: a fix with a test, a proposal, a deferred page, a rejected page (`docs`, `references/area-passes.md`). A proposal with several separable parts becomes a folder with an index holding the build order (`docs`, `references/page-shapes.md`), as `apps/web/content/docs/proposals/resource/todo-list/index.md` does. A gap left as a sentence in a report and nowhere else is found again next pass — which is churn.
