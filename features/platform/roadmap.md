# Platform Roadmap

The Resource Explorer consolidation: everything becomes a resource (`/architecture/resources.md`), the explorer replaces every per-editor page ([specs/resource-explorer.md](specs/resource-explorer.md)). No backwards compatibility; existing documents/surveys data is discarded. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items.

**Phase-order note:** `surveys` stays on its own table until Phase 5 (folding it in Phase 1 would drag the whole survey frontend rewrite forward). `ResourceType.Table` is a transitional type carrying the multi-item table-editor blob until the File/TodoList split in Phase 4. The table editor, dashboard, email, webpage, flowchart still render on their existing top-level pages (the explorer deep-links to them) until Phase 3+ turns them into blades.

## Phase 1 — schema + factory + container ✅ (shipped)

- [x] `packages/db-schema`: `ResourceType` enum + `resources` table (renamed from `documents`); `DatabaseEntityType.Document` → `.Resource` (+ `.ResourcePublication`); relations updated. `surveys` retained (folds in Phase 5)
- [x] **Publish normalized** into `resource_publications` (row exists iff published) — `publishedAt`/`publishVersion` off the base row; `resourcesRelation.publication`, `resourcePublicationsRelation`
- [x] `AzureContainer.ResourceAssets` replaces the editor/survey containers (Survey's kept until Phase 5)
- [x] `ResourceDefinitionMap` + `ResourceDefinition` + derived unions (`PublishableResourceType`, `DatasetProviderResourceType`, `PortableResourceType`); File/Survey/TodoList content schemas under `shared/models/resource/<type>/`
- [x] `createResourceProcedures`: definition-map-driven schema/container, conditional publish procedures (`publishResource`/`unpublishResource`/`readResourcePublication`/`readPublishedResourceContent`) via `resource_publications`, `transformPublishedContent`/`transformReadContent` hooks; `getOwnerProcedure` on `resources` + typeless overload
- [x] Cross-type `resource` router: `readResource`, `readResources` (search + type facets)
- [x] Per-type routers rewired; achievement `triggerPath`s → `*.saveResourceContent`
- [x] Client: `useResourceState` (+ `publication` ref), stores/headers/`ResourcePublisher`, `/resources` explorer replaces the documents hub, `ProductListLinkItems` → Resource Explorer entry
- [x] Tests: generic matrix consolidated into `createResourceProcedures.test.ts`; per-type tests trimmed to wiring; `resource.test.ts` for cross-type list
- [x] Migration generated (`20260707004532_aberrant_emma_frost`: enum rename + File/Survey/TodoList, `resource_publications` created, `documents`→`resources`, publish columns dropped, FK cascade)
- [x] 5 orphaned containers deleted in dev+prod (`dashboard-assets`, `email-editor-assets`, `flowchart-editor-assets`, `table-editor-assets`, `webpage-editor-assets`); `resource-assets` auto-creates at runtime (no infra tracking)
- [x] Publish-split migration applied (`pnpm db:up` in `packages/db-schema`)

## Phase 2 — explorer shell

Azure-portal-faithful surface: `/resources` is the **Home** (search + quick-create + recents), the full list is its own page, and **Create is a dedicated flow** (gallery → per-type form), never a modal. See [specs/resource-explorer.md](specs/resource-explorer.md).

- [ ] `/resources` **Home** (`pages/resources/index.vue`): resource search bar, quick-create tiles (`ResourceDefinitionMap` entries → `/resources/create/[type]`, Azure "services" row), recent-resources rows (name · type · updatedAt, sorted desc, capped) with a **See all** link, and a primary **Create a resource** button
- [ ] `/resources/all` (`pages/resources/all.vue`): full `StyledDataTableServer` over `resource.readResources` (name, type facet, status, updatedAt), search, row → `/resources/[id]`; the **See all** target
- [ ] `/resources/create` (`pages/resources/create/index.vue`): type-picker **gallery** (marketplace) listing `ResourceDefinitionMap` entries with icon + title + description → `/resources/create/[type]`
- [ ] `/resources/create/[type]` (`pages/resources/create/[type].vue`): per-type create form (name + any type-specific initial settings), Review + Create → `createResource` → routes to `/resources/[id]`
- [ ] `/resources/[id]/[[blade]]` page: left blade menu, Overview blade (Essentials + type summary), toolbar commands (rename/delete + capability commands), blade route middleware
- [ ] `useResource(id)` blade-scoped composable (successor of `useResourceState` for the blade page)
- [ ] `ResourceBladeDefinitionMap`, `PortableFormatMap`, `ViewComponentMap` skeletons
- [ ] `/view/[type]/[id]` dynamic public page dispatching `ViewComponentMap` (replaces per-type view pages)
- [ ] Trim per-editor `ProductListLinkItems` entries once editors become blades ([specs/shell-cohesion.md](specs/shell-cohesion.md))

## Phase 3 — thin editors migrate (Flowchart, Email, Webpage, Dashboard)

- [ ] Per type: router → `createResourceProcedures`, editor page → Editor blade under `components/Resource/<Type>/`, store retargets to `useResource`
- [ ] Dashboard keeps `transformPublishedContent` (baked dataset snapshots); Webpage view component moves to `ViewComponentMap`
- [ ] Email: `PortableFormatMap[Email]` export-only html (personalized export); Email/Flowchart lose their unused publish endpoints (capability not declared)
- [ ] Delete `pages/{dashboard/*,email-editor,webpage-editor,flowchart-editor}.vue`, `pages/view/{dashboard,webpage}/[id].vue`

## Phase 4 — File split + TodoList

- [ ] `fileResourceSchema` (`{ settings, data }`) + model relocation; `TableEditorConfiguration`/`TableEditorType`/VuetifyComponent models deleted ([spec](specs/file-resource.md), [out-of-scope/vuetify-component-resource.md](out-of-scope/vuetify-component-resource.md))
- [ ] Data + Settings blades; `TableEditor/File/*` → `Resource/File/*`; store tree → `store/resource/file/` (command/undo stack intact; `item.ts` + type switching die)
- [ ] Portable wiring from `DataSourceConfigurationMap` → `PortableFormatMap[File]`; empty-data `StyledEmptyState` + Import command
- [ ] `todoListSchema` + Items blade; Calendar blade over this list ([deferred/global-calendar.md](deferred/global-calendar.md)); delete `pages/{table-editor,calendar}.vue`
- [ ] Dataset provider re-key: `DatasetProviderType.TableDocument` → `File`, `readFileDataset` reads `content.data`, `DatasetReference.itemId` removed

## Phase 5 — Survey fold

- [ ] `survey` router = factory + response/SAS procedures; survey CRUD procedures + `getCreatorProcedure` deleted ([spec](specs/survey-resource.md))
- [ ] Publish hooks: asset clone in `transformPublishedContent`, SAS refresh in `transformReadContent`; blob paths unify onto the standard convention
- [ ] Editor blade (SurveyJS creator, autosave → `saveResourceContent`) + Responses blade
- [ ] `/view/survey/[id]` respondent renderer; `RoutePath.Survey(id)` aliases it; delete `pages/{surveyer/*,survey/[id]}.vue` + `Survey/CrudView/*`

## Phase 6 — deletions + cross-cutting sweep

- [ ] Delete `pages/documents.vue`, `Document/{Picker,PublishButton}.vue`, `useDocumentState`, `services/document/*` maps, dead `RoutePath` members
- [ ] Achievement `triggerPath` updates (`"flowchartEditor.saveDocumentContent"` → `"flowchart.saveResourceContent"`, …) — compile-checked against the router type
- [ ] Grep sweep: no `document`/`surveyer`/`tableEditor` identifiers left outside history; `pnpm typecheck` + full test run green

## Notes

- Zero new dependencies, zero new Azure services — one renamed table, one container replacing six, reshaped routers. Email sending stays deferred ([deferred/email-sending.md](deferred/email-sending.md)).
- Pre-consolidation polish items (survey copy-link, cross-product navigation links, response counts, share-to-esbabbler, command palette) are superseded or re-homed: copy-link and dead-end fixes come free with the explorer toolbar/Overview; "Surveyer → analyse" becomes the Responses blade; share-to-esbabbler and the command palette remain good post-consolidation ideas — re-add after Phase 6 if still wanted.
- The 10k dataset row cap ([deferred/dataset-row-cap-pagination.md](deferred/dataset-row-cap-pagination.md)) still silently truncates large surveys — surface a "showing N of M" warning if a real survey approaches it.
