# Platform Roadmap

The Resource Explorer consolidation: everything becomes a resource (`/architecture/resources.md`), the explorer replaces every per-editor page ([specs/resource-explorer.md](specs/resource-explorer.md)). No backwards compatibility; existing documents/surveys data is discarded. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items.

## Phase 1 — schema + factory + container

- [ ] `packages/db-schema`: `ResourceType` enum + `resources` table (rename of `documents` absorbing `surveys` — `model`→blob, `modelVersion`→`contentVersion`, `group` dropped); delete `documents.ts`, `surveys.ts`, `DocumentType.ts`; migration drops `documents` + `surveys` + old enums; relations updated; `DatabaseEntityType.Document`/`.Survey` → `.Resource`
- [ ] `AzureContainer.ResourceAssets` replaces the six editor/survey containers; Pulumi change in `packages/infra`
- [ ] `ResourceDefinitionMap` + `ResourceDefinition` + derived unions (`PublishableResourceType`, `DatasetProviderResourceType`, `PortableResourceType`); content schemas relocated to `shared/models/resource/<type>/`
- [ ] `createResourceProcedures` (from `createDocumentProcedures`): definition-map-driven schema/container, conditional publish procedures with conditional return type, `transformPublishedContent(ctx, resource, content)` + `transformReadContent(ctx, resource, content)` hooks; `getOwnerProcedure` on `resources` + typeless overload
- [ ] Cross-type `resource` router: `readResource`, `readResources`
- [ ] Router tests updated (factory + per-type)

## Phase 2 — explorer shell

- [ ] `/resources` list page: `StyledDataTableServer`, type facets, Draft/Published chips, Create dialog (type picker) ([spec](specs/resource-explorer.md))
- [ ] `/resources/[id]/[[blade]]` page: left blade menu, Overview blade (Essentials + type summary), toolbar commands (rename/delete + capability commands), blade route middleware
- [ ] `useResource(id)` composable (successor of `useDocumentState` detail half; auth-only, localStorage path deleted — [deferred/unauth-local-resources.md](deferred/unauth-local-resources.md))
- [ ] `ResourceBladeDefinitionMap`, `PortableFormatMap`, `ViewComponentMap` skeletons
- [ ] `/view/[type]/[id]` dynamic public page dispatching `ViewComponentMap`
- [ ] Nav: `ProductListLinkItems` → single Resources entry ([specs/shell-cohesion.md](specs/shell-cohesion.md))

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
