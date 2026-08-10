# Docs tree layout and page templates

Read when creating a page and deciding where it goes: the directory layout, sidebar grouping, the feature-page and proposal templates, deferred/rejected and roadmap page bodies, and the lifecycle map.

## Directory layout

```text
packages/app/content/docs/
  index.md                    ← landing: what Esposter is + map of the docs
  architecture/
    index.md                  ← index of cross-cutting topics
    <topic>.md                ← as-built system explanation shared by multiple areas
  <area>/                     ← one kebab-case directory per product area (`ls content/docs` for the current set)
    index.md                  ← what the area is, key concepts, terse chronological shipped log
    <feature>.md              ← one page per implemented feature (or <feature>/ folder with index.md + sub-feature pages)
    deferred/
      index.md                ← one-line list of every deferred idea
      <idea>.md               ← one not-yet idea per page, with revisit trigger
    rejected/
      index.md                ← one-line list of every rejected idea
      <idea>.md               ← one won't-do idea per page
    roadmap.md                ← open work only (omit for mature areas with none)
  proposals/
    <area>/<name>.md          ← unimplemented design spec, one folder per area
    refactors/<name>.md       ← cross-area refactor plans (not an area — no index/roadmap/deferred). A mechanical sweep is not one: it designs no behaviour and lives in `.claude/ledgers/` (`sweeps` skill)
```

## Sidebar grouping

Sections with many flat feature pages get logical subheader groups in the in-app left sidebar via `packages/app/app/services/docs/DocsSectionGroupsMap.ts` (section slug → group title → page slugs; declaration order is display order). When adding a feature page to a mapped section, add its slug to the right group — unmapped slugs render ungrouped at the top. `roadmap`/`deferred`/`rejected` group automatically under a trailing "Planning" subheader; sections with few pages need no map entry (alphabetical is enough).

## Feature page template

```markdown
# <Feature Name>

One-sentence description and value.

## How it works ← prose + the mandated diagram

## Data model ← only if it owns tables/schemas

## Procedures ← | Procedure | Auth | Input | Purpose | — only if it owns procedures

## Key files ← | File | Role |

## Notes ← constraints, alternatives rejected, gotchas
```

Omit any section with nothing to say.

## Proposals

Same template plus an explicit scope: what works today vs what the proposal adds, cheapest viable infrastructure (reuse existing Azure resources first), and failure/retry semantics when background work is involved. A proposal is the design conversation done in advance — trim it the moment implementation teaches you better.

## Deferred and rejected pages

One page per idea (kebab-case slug named after the idea); each folder carries an `index.md` listing every page in one line. Page body:

- **`rejected/`** — what it was, **Why not**.
- **`deferred/`** — what it was, **Why deferred**, and **Revisit when:** the concrete trigger. Optionally the **Cheaper interim** already covering the need.

## Roadmap pages

Prioritized top-down, checkbox-driven (`- [ ]` with nested sub-steps), grouped by horizon (`## In progress`, `## Next`, `## Later`).

## Lifecycle map

| State                     | Location                     | Action                                                                                   |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Idea                      | `<area>/roadmap.md`          | Checkbox item; grep `deferred/` + `rejected/` first                                      |
| Designed                  | `proposals/<area>/<name>.md` | Write the proposal; roadmap item links to it                                             |
| Shipped                   | `<area>/<feature>.md`        | Rewrite proposal as an as-built page; delete proposal + roadmap item; log in `index.md`  |
| Shipped (one-time change) | —                            | Delete proposal + roadmap item, sweep references, one shipped-log line — no feature page |
| Won't do                  | `<area>/rejected/<idea>.md`  | One page with rationale                                                                  |
| Deferred                  | `<area>/deferred/<idea>.md`  | One page with rationale + revisit trigger                                                |
