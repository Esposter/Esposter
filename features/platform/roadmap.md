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

- [x] `/resources` **Home** (`pages/resources/index.vue`): resource search bar → `/resources/all`, quick-create tiles (`ResourceCreateGallery` dense → `/resources/create/[type]`), recent-resources rows (name · type · updatedAt via `useReadResources`, capped) with a **See all** link, primary **Create a resource** button, empty state
- [x] `/resources/all` (`pages/resources/all.vue`): full `StyledDataTableServer` over `resource.readResources` (type facet, name, created/updated — **no status column**, see note), search prefilled from `?search`, row → `/resources/[id]`; the **See all** target
- [x] `/resources/create` (`pages/resources/create/index.vue`): type-picker **gallery** (`ResourceCreateGallery`) → `/resources/create/[type]`
- [x] `/resources/create/[type]` (`pages/resources/create/[type].vue`): per-type create form (name via `resourceNameRules`) → `useCreateResource` → routes to `/resources/[id]`
- [x] `/resources/[id]/[[blade]]` page: left blade menu (Overview + `ResourceBladeDefinitionMap`), Overview blade (Essentials + summary slot), toolbar (rename/delete + publish/import/export by capability), inline blade validation
- [x] `useResource(id)` blade-scoped composable — **metadata scope** (row load, rename, delete, publish/unpublish); typed content + type summary land with each editor's blade migration (Phase 3-5)
- [x] `ResourceBladeDefinitionMap`, `PortableFormatMap`, `ViewComponentMap` skeletons
- [x] `/view/[type]/[id]` dynamic public page dispatching `ViewComponentMap` (skeleton map ⇒ 404s until types migrate off their static view pages in Phase 3/5)
- [ ] Trim per-editor `ProductListLinkItems` entries once editors become blades ([specs/shell-cohesion.md](specs/shell-cohesion.md)) — happens incrementally in Phase 3 as each editor migrates (Flowchart entry removed; Table/Email/Webpage/Dashboard/Survey entries remain until theirs land)

**Phase 2 transitional notes.** The create gallery offers only the `createResourceProcedures`-backed, `resources`-table types (`ResourceType.Table`, `Dashboard`, `Webpage`, `Email`, `Flowchart` — `CreatableResourceTypes`). Survey lives on its own `surveys` table (folds Phase 5) so it never appears in `resource.readResources` and is excluded; File/TodoList have no router yet (Phase 4). Router keys stay the legacy editor names (`tableEditor`/`emailEditor`/…), so `useCreateResource`/`useResource` dispatch through explicit per-type maps until the Phase 3-4 renames. Publish **status** is intentionally omitted from the `/all` list (surfaced per-resource on Overview instead).

## Phase 3 — thin editors migrate (Flowchart, Email, Webpage, Dashboard) ✅ (shipped)

- [x] Per type: router → `createResourceProcedures`, editor page → Editor blade under `components/Resource/<Type>/`, store retargets to `useResource`
- [x] Dashboard keeps `transformPublishedContent` (baked dataset snapshots); Webpage view component moves to `ViewComponentMap`
- [x] Email: `PortableFormatMap[Email]` export-only html (personalized export); Email/Flowchart lose their unused publish endpoints (capability not declared)
- [x] Delete `pages/{dashboard/*,email-editor,webpage-editor,flowchart-editor}.vue`, `pages/view/{dashboard,webpage}/[id].vue`

**Flowchart ✅ (shipped — first inline editor, established the mechanism).** `useResource` gained
blob content (`readContent`/`save`, optimistic `contentVersion`) — the "store retargets to `useResource`"
enabler every remaining editor reuses. New `ResourceEditorComponentMap` (`Partial<Record<ResourceType,
Component>>`) supplies the component the built-in **Editor** blade renders inline; `BladeOutlet` renders it
under `<ClientOnly>` (VueFlow can't SSR), else falls back to `EditorLaunch`. `store/flowchartEditor`
retargets to `useResource` (drops the `localStorage`/multi-resource/query-param path; id read from the route
per call so the persisted store never goes stale); the node palette moved off the app left drawer to an
on-canvas `<Panel>` (`isSidebarOpen`). Deleted `pages/flowchart-editor.vue` +
`useReadFlowchartEditor` + the Flowchart `ProductListLinkItems` entry (the Phase-2-deferred per-editor
launcher trim, now applicable). Router key `flowchartEditor`, the `flowchartEditor/` folders, and
`RoutePath.FlowchartEditor`/`ResourceTypeRoutePathMap[Flowchart]` stay for the Phase 6 rename/grep sweep.

**Email ✅ (shipped — first Portable inline editor).** Same blade migration (GrapesJS canvas renders
inline under `<ClientOnly><Suspense>` in `BladeOutlet`; `store/emailEditor` retargets to `useResource`,
drops `localStorage`, and holds the live `editor` as the bridge for the command-bar export). The
**Portable capability is now wired**: `PortableFormat` reshaped from `serialize(content)→string`+`mimeType`
to a self-contained async `export()` (so a format can pull the editor + dataset + zip N files);
`PortableActions` renders an Export menu from `PortableFormatMap[type]`; `PortableFormatMap[Email]` = the
personalized-HTML export (via the extracted `exportPersonalizedHtml` service). Import lands with File
(Phase 4). Also added a generic `hasCapability(type, capability)` guard + `CapabilityResourceType<T>`
(the three derived unions now alias it), replacing the per-capability `getIs*` helpers. Deleted
`email-editor.vue`, `EmailEditor/{Header,ExportPersonalizedHtmlButton}.vue`, the Email launcher entry, and
the dead `localStorage` key.

**Webpage ✅ + Dashboard ✅ (shipped — first `ViewComponentMap` renderers).** Same blade migration
(`store/webpageEditor` and `store/dashboard` retarget to `useResource`, dropping `useResourceState`
`localStorage` paths + their `LocalStorageKey`s and launcher entries). Both types registered their public
renderers in `ViewComponentMap` (`Resource/Webpage/View.vue` iframe-srcdoc, `Resource/Dashboard/View.vue`),
so `/view/[type]/[id]` now serves them and the static `pages/view/{webpage,dashboard}/[id].vue` pages are
deleted. Dashboard's autosave watch (deep-diff `virtualDashboard`) moved from the deleted
`useReadDashboard` into the Editor blade, guarded so the initial load doesn't write back; the visual-type +
edit-item query-param deep-links keep working on the blade route. The Dashboard editor header lost its
viewer-page button (`/dashboard` deleted — the published view is the render surface now).

## Phase 4 — File split + TodoList ✅ (shipped)

- [x] `fileResourceSchema` (`{ settings, data }`) + model relocation; `TableEditorConfiguration`/`TableEditorType`/VuetifyComponent models deleted ([spec](specs/file-resource.md), [out-of-scope/vuetify-component-resource.md](out-of-scope/vuetify-component-resource.md))
- [x] Data + Settings blades; `TableEditor/File/*` → `Resource/File/*`; store tree → `store/resource/file/` (command/undo stack intact; `item.ts` + type switching die)
- [x] Portable wiring from `DataSourceConfigurationMap` → `PortableFormatMap[File]`; empty-data `StyledEmptyState` + Import command
- [x] `todoListSchema` + Items blade; Calendar blade over this list ([deferred/global-calendar.md](deferred/global-calendar.md)); delete `pages/{table-editor,calendar}.vue`
- [x] Dataset provider re-key: `DatasetProviderType.TableDocument` → `File`, `readFileDataset` reads `content.data`, `DatasetReference.itemId` removed

**Shipped notes.** Per-type blades are now real infrastructure: `BladeDefinition` gained a `slug` route segment,
`ResourceBladeDefinitionMap` supplies File (Data/Settings) + TodoList (Items/Calendar), the blade nav shows
the built-in Editor blade only for types in `ResourceEditorComponentMap`, and the resource page 404-guards
per-type slugs after load (`isValidResourceBlade`). The command/undo stack was re-seamed from the deleted
`DataSourceItem` onto `DataSource` directly (`ADataSourceCommand.execute(dataSource)`; `useFileCommand`
autosaves after every command, undo/redo, and import). `store/resource/file` holds `fileResource`
(`{ settings, data }`) loaded via `useResource`; `store/resource/todoList` owns items + the edit dialog with
snapshot-revert saves. Serializers re-seamed from items to `FileSettings`; exporting as another format falls
back to that format's default settings. `PortableFormat` became fully self-contained (`import()` + `export()`)
and `PortableActions` renders both menus; the Data-blade Import button keeps the 5-row preview.
`ResourceType.Table` is gone from the enum (**pg enum migration still needs `pnpm db:gen`/`db:up` — not run**),
`tableEditor` router → `file` + `todoList`, achievements re-keyed to `file.saveResourceContent`
(`content.data.rows.length`), `EditorLaunch`/`ResourceTypeRoutePathMap`/`useResourceState` and the dead
`RoutePath` members deleted; `ANamedItemEntity` (ex-`ATableEditorItemEntity`) moved to `shared/models/entity/`.

## Phase 5 — Survey fold ✅ (shipped)

- [x] `survey` router = factory + response/SAS procedures; survey CRUD procedures + `getCreatorProcedure` deleted ([spec](specs/survey-resource.md))
- [x] Publish hooks: asset clone in `transformPublishedContent`, SAS refresh in `transformReadContent`; blob paths unify onto the standard convention
- [x] Editor blade (SurveyJS creator, autosave → `saveResourceContent`) + Responses blade
- [x] `/view/survey/[id]` respondent renderer; delete `pages/{surveyer/*,survey/[id]}.vue` + `Survey/CrudView/*`

**Shipped notes.** The `surveys` table, `surveysRelation`, `DatabaseEntityType.Survey`, and
`AzureContainer.SurveyAssets` are gone from `packages/db-schema` (**pg migration still needs
`pnpm db:gen`/`db:up` — not run**, same as the Phase 4 Table-enum migration). The router keeps the
survey-specific procedures (`create/read/updateSurveyResponse` public rate-limited on
`AzureTable.SurveyResponses`, upload/download SAS + `deleteFile` under `{id}/files/…` via
`getOwnerProcedure`); `updateSurveyResponse`'s duplicate-model guard now compares structurally
(the old `===` on records never fired). Publish clones referenced assets under
`{id}/published/{v}/…` in `transformPublishedSurvey` (keyed by the version the factory is about to
claim) and bakes 1-year SAS URLs; `transformReadSurvey` re-signs working-copy URLs on every read.
`readResourceContent` was extracted to a shared service (`readResourceContent.ts`) so the factory
and `readSurveyResponsesDataset` share one blob-read path, and factory `readResources` now rides
`publication` along (the Email editor's published-survey invite blocks filter on it). Client:
`store/survey` retargets to `useResource`; `useSurveyCreator` builds the creator after `loadContent`
(skeleton until then) with autosave through `saveModel` (`{ model }` blob, THEME_KEY embedded);
Editor/Responses (dataset table over `dataset.readDataset`)/View (respondent renderer, ported from
`pages/survey/[id].vue` onto `readPublishedResourceContent`) live under `components/Resource/Survey/`;
Survey joined `CreatableResourceTypes`/`ViewComponentMap`/`ResourceEditorComponentMap`. Existing
survey rows/blobs are discarded by design. The creator toolbar dropped its Publish dialog (the
explorer Overview publish toggle owns it); `RoutePath.Survey`/`Surveyer`/`SURVEY_DISPLAY_NAME` are
deleted — invite links use `RoutePath.View(ResourceType.Survey, id)`.

## Phase 6 — deletions + cross-cutting sweep ✅ (shipped)

- [x] Delete `pages/documents.vue`, `Document/{Picker,PublishButton}.vue`, `useDocumentState`, `services/document/*` maps, dead `RoutePath` members
- [x] Achievement `triggerPath` updates (`"flowchartEditor.saveDocumentContent"` → `"flowchart.saveResourceContent"`, …) — compile-checked against the router type
- [x] Grep sweep: no `document`/`surveyer`/`tableEditor` identifiers left outside history; `pnpm typecheck` + full test run green

**Shipped notes.** The document deletions had already landed with Phases 1-4; Phase 6's remaining work
was the router renames: `flowchartEditor` → `flowchart`, `emailEditor` → `email`, `webpageEditor` →
`webpage` (router files, `trpcRouter` keys, `$trpc` call sites, achievement `triggerPath`s, wiring
tests). The `FlowchartEditor`/`EmailEditor`/`WebpageEditor` content **classes** and their
`store/`/`models/`/`services/` folders deliberately keep their names — they are registered in
`JSONClassMap`, so renaming them would break superjson deserialization of persisted blobs.
`RoutePath` dropped its dead `Dashboard`/`Survey`/`Surveyer` members and the computed
`SURVEY_DISPLAY_NAME` keys.

## Notes

- Zero new dependencies, zero new Azure services — one renamed table, one container replacing six, reshaped routers. Email sending stays deferred ([deferred/email-sending.md](deferred/email-sending.md)).
- Pre-consolidation polish items (survey copy-link, cross-product navigation links, response counts, share-to-esbabbler, command palette) are superseded or re-homed: copy-link and dead-end fixes come free with the explorer toolbar/Overview; "Surveyer → analyse" becomes the Responses blade; share-to-esbabbler and the command palette remain good post-consolidation ideas — re-add after Phase 6 if still wanted.
- The 10k dataset row cap ([deferred/dataset-row-cap-pagination.md](deferred/dataset-row-cap-pagination.md)) still silently truncates large surveys — surface a "showing N of M" warning if a real survey approaches it.
