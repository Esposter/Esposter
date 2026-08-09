---
title: Simplification Sweep
description: Sweep ledger for running the finishing-a-change cleanup pass over every area of the repo — one bounded pass per area, ticked as it lands.
---

# Simplification Sweep

The [finishing-a-change](https://github.com/Esposter/Esposter/blob/main/AGENTS.md) ritual runs on new work by default. This ledger applies it **retroactively**, area by area, to code written before it existed — where duplicated copy, twin helpers, restated constants and special cases layered on shared mechanisms have had time to accumulate.

One area per pass, each bounded so it fits a single review chunk. A pass is not a rewrite: it changes no behaviour, and anything that would is split out and raised separately.

## What one pass does

```mermaid
flowchart LR
  SCOPE["pick the next unticked area"] --> REVIEW["review it on four angles<br/>reuse · simplification · efficiency · altitude"]
  REVIEW --> APPLY["apply the fixes<br/>behaviour-preserving only"]
  APPLY --> TESTS["ground it<br/>regression tests + dedupe fixtures"]
  TESTS --> DOCS["carry docs + skills"]
  DOCS --> CHECK["format · typecheck · lint · tests"]
  CHECK --> TICK["tick the box, commit"]
  TICK --> SCOPE
```

The four angles, and the rules each answers to:

| Angle          | Looks for                                                               | Owner                                   |
| -------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| Reuse          | a twin of an existing helper, a constant restated, copy duplicated      | `file-organization`                     |
| Simplification | derivable state, copy-paste variation, dead code, one-consumer generics | `typescript`, `vue-composable-patterns` |
| Efficiency     | repeated I/O, sequential independent work, needless recomputation       | `pinia`, `pagination`                   |
| Altitude       | a special case bolted onto shared infrastructure                        | the area's own skill                    |

**Tests are part of the pass, not a follow-up.** Repeated fixtures collapse into one `create*` helper, twin test files collapse into a behaviour matrix plus a thin wiring test, and anything the pass exposes gets the regression test it was missing (`testing` skill). A simplification with nothing asserting it is a claim, not a result.

**Docs move with the code.** A page whose Key Files or mechanism changed is updated in the same pass; a convention worth reusing goes into its owning skill rather than this ledger.

## Areas

Ordered by expected payoff — the biggest surfaces with the most recent churn first. Tick as each lands.

### Platform / resource explorer

- [x] `Resource/List` + the list composables — done as part of the service-menu work
- [x] `Resource/Blade`, `Resource/Overview`, `Resource/Explorer` — the resource page shell
- [x] `Resource/Sheet` components — the grid, its slots and dialogs
- [x] `composables/resource/sheet` — the command/history layer
- [x] `services/resource/sheet` — column inference, transformations, (de)serialization
- [x] `store/resource/sheet` + `shared/models/resource/sheet`
- [x] `Resource/Dashboard`, `Resource/Email`, `Resource/Webpage`, `Resource/Flowchart` — the canvas editors
- [x] `Resource/Survey`, `Resource/Program`, `Resource/TodoList`, `Resource/Blueprint`, `Resource/Note`
- [x] `app/composables/resource` + `app/services/resource` — what the sweep above leaves behind
- [x] `app/store/resource` — store shapes against the `pinia` skill

### Messaging

- [ ] `app/components/Message` — the largest component tree in the repo
- [ ] `app/composables/message` + `app/services/message`
- [ ] `app/store/message` + the call/voice stores

### Server

- [ ] `server/trpc/routers/message` — the largest router, and its test file
- [ ] `server/trpc/routers/room` — same shape, same size
- [ ] the remaining routers, against the `trpc` skill
- [ ] `server/services` — the helpers the routers share

### Shared and cross-cutting

- [ ] `app/components/Styled` — the primitives everything else composes
- [ ] `shared/models` + `shared/services`
- [ ] `packages/shared` and `packages/shared-node`

### Packages

- [ ] `packages/db`, `packages/db-schema`, `packages/db-mock`, `packages/azure-mock`
- [ ] `packages/azure-functions`
- [ ] `packages/virrun`
- [ ] `packages/vue-phaserjs`, `packages/parse-tmx`, `packages/xml2js`
- [ ] `packages/infra`
- [ ] `packages/configuration`

### Prose

- [ ] `content/docs` — one decision per page, links instead of retellings
- [ ] `.claude/skills` — the same, against the ownership map in its README

## Bounds

- **Behaviour-preserving only.** A finding whose fix would change behaviour is noted in the commit message and raised as its own proposal, not folded in.
- **One area per commit**, so a pass that turns out wrong reverts cleanly.
- **Chunked for review** — an area that would exceed the review file budget is split at a sub-directory boundary and gets its own line here.
- Findings deliberately skipped (with the reason) belong in the commit message; this ledger only tracks coverage.

## Raised, not folded in

Findings a pass surfaced whose fix is real work rather than cleanup. Each needs its own proposal before it is attempted:

- **`useResource` as a blade-scoped store.** The resource page threads its whole state through page → Explorer → Actions/Outlet; the `pinia` and `vue-component-patterns` skills both point at a store instead, which would delete the drilling outright.
- **Content classes are not what the wire delivers.** A content schema is declared `satisfies z.ZodType<ToData<T>>` and `readContentBlob` parses plain JSON with it, so the client receives the data shape — never the class instances the Sheet, Dashboard and TodoList stores type their refs as. Those three casts are all that is left of the gap; the honest fix is for a store to revive its content the way `Dashboard` already does, or to hold the `ToData` shape it is actually given.
- **The publication on the generic resource read.** `readResource` then `readResourcePublication` is two round trips where the second re-resolves ownership; `resourcePublications` is one generic table, so the publication could ride the first response.
- **Lazy portable-format loading.** The command bar statically pulls the xlsx read/write libraries into every resource page's chunk, including types that can never import or export.
- **Column formatting is built but never called.** `formatValue` and its `formatBoolean`/`formatNumber` helpers have no caller — the cell renderer does `String(value)` — yet the sheet editor's index lists number/boolean/date format options as shipped. Either wire it into the renderer (and then sorting and search, which read `String(value)`, diverge from what is displayed) or delete the cluster and cascade to `BooleanFormats`, `NumberFormats` and the three `Intl` formatters. Leaving it is not an option: unused exports are banned.
- **`shared/` reaches into app-only client code.** Nine files under `shared/models/resource/sheet/column/` import from `@/` — vjsf select-items context and an Ajv keyword — and they are the only such imports in the whole shared tree. The cause is that transformations have no form twin, so presentation meta is baked into `columnTransformationSchema`, which is inside the schema the _server_ parses. The cheap fix moves two files into `shared/`; the principled one gives transformations `*TransformationForm` twins.
- **`DataSourceStatistics` is persisted derived state.** All three fields are recomputed from `columns` and `rows` by `syncStatistics`, which every command calls on both execute and undo, so the stored copy can never legitimately differ. Dropping it from the blob is behaviour-changing (and needs the fixtures that restate it updated), which is why it was not folded in.
- **An appending paste is not redo-stable.** `PasteRangeCommand.doExecute` constructs the appended `Row` inside execute rather than in its constructor, so undo-then-redo of a paste that appended rows mints fresh row ids. The undo/redo invariant matrix found this; its paste case is narrowed to a pure overwrite until the row construction moves into the constructor.
- **The flowchart editor's dirty check is defeated.** `saveFlowchartEditor` calls `saveItemMetadata`, bumping `updatedAt` before every save, so `useResource.save`'s `JSON.stringify` comparison can never match — while `useSave.getSnapshotJson` deliberately excludes `updatedAt` for exactly this reason. VueFlow emits `update:nodes` per drag frame, so the blade issues a real `contentVersion`-bumping write per debounce tick whether or not anything changed. The fix is either dropping `saveItemMetadata` here or teaching `useResource.save` the same exclusion; both change what is written and how often.
- **`readProgramStatus` ships every participant's `token` to the browser.** The Status blade never renders it, and `ProgramStatusRow`'s own comment calls the token "the credential that responds on their behalf". Not an authorization hole — the owner is entitled to those tokens — but the status read has no reason to carry them, and dropping the field is a server plus shared-model change. `publicId` is likewise unread by the client.
- **Statistics read cells behind `computeValue`'s back.** `computeColumnStatisticsForColumn` reads `row.data` directly, and a computed column never writes there — so every computed column reports empty statistics and a zero null count, while the index lists computed-column stats as shipped. Routing it through `computeValue` fixes that and starts populating stats, outliers and charts for those columns, which is a visible change.

## Done

Delete this page once every box is ticked — the ritual it applies lives in `AGENTS.md`, and the conventions it enforces live in the skills. Nothing here is worth keeping as a record.
