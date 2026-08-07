---
title: Resource Explorer
description: The single Azure-portal-like UI for every resource — Home, list, marketplace create flow, and a resource page composing capability-aware blades.
---

# Resource Explorer

The single Azure-portal-like UI for every resource: one list, one resource page with capability-aware blades, one public view route. It replaced the documents hub and all per-editor top-level pages — the shell is driven entirely by `ResourceDefinitionMap` ([/docs/architecture/resources](/docs/architecture/resources)). Azure Portal is the UX reference, deliberately literal: Home mirrors the portal landing, Create mirrors the marketplace (a page per resource type, never a modal).

| Azure portal                    | Resource Explorer                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Home (search + recents)         | `/resources`                                                                                         |
| All resources list              | `/resources/all`                                                                                     |
| Create a resource (marketplace) | `/resources/create` gallery → `/resources/create/[type]`                                             |
| Resource menu (left nav)        | blade menu on `/resources/[id]/[[blade]]`                                                            |
| Overview + Essentials           | Overview blade with Essentials panel                                                                 |
| Toolbar commands                | Refresh/Rename/Delete/Duplicate always; Publish/Import/Export by capability                          |
| Breadcrumbs                     | the click path only, current page as the title ([breadcrumb trail](/docs/platform/breadcrumb-trail)) |

## Routes

| Route                       | Page                                        | Purpose                                                                                                            |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/resources`                | `pages/resources/index.vue` (auth)          | Home — search + quick-create + recent resources                                                                    |
| `/resources/all`            | `pages/resources/all.vue` (auth)            | full list (all types, search)                                                                                      |
| `/resources/create`         | `pages/resources/create/index.vue` (auth)   | create gallery — type picker (marketplace)                                                                         |
| `/resources/create/[type]`  | `pages/resources/create/[type].vue` (auth)  | per-type create form (name + initial settings) → `/resources/[id]`                                                 |
| `/resources/[id]/[[blade]]` | `pages/resources/[id]/[[blade]].vue` (auth) | resource page; omitted blade = Overview; blade validated in route middleware                                       |
| `/view/[type]/[id]`         | `pages/view/[type]/[id].vue` (public)       | published view, dispatched via `ViewComponentMap` ([/docs/architecture/publishing](/docs/architecture/publishing)) |

`all` and `create` are static segments so they win over the dynamic `[id]` sibling. Blades are path segments (not query params) so they deep-link. Email invite blocks link the public respondent page via `RoutePath.View(ResourceType.Survey, id)`. `ProductListLinkItems` has one **Resources** entry (landing on Home) replacing the seven old editor entries.

The whole explorer is **client-only rendered**: `packages/app/configuration/routeRules.ts` sets `ssr: false` for `/resources` and `/resources/**` (route-level, not just the per-blade `<ClientOnly>` wrappers). It is an auth-gated app surface with no SEO value that touches `window`/`localStorage` during setup, so there is nothing worth server-rendering. Only the public `/view/[type]/[id]` pages stay SSR, for SEO and social/OG unfurls.

## Navigation map

```mermaid
flowchart LR
  HOME["/resources (Home)<br/>search · quick-create tiles · recent resources"]
  HOME -->|See all| ALL["/resources/all<br/>full list · search"]
  HOME -->|Create a resource| CREATE["/resources/create<br/>type gallery"]
  HOME -->|quick-create tile| CFORM["/resources/create/[type]<br/>name + initial settings"]
  CREATE -->|pick type| CFORM
  CFORM -->|createResource| RES["/resources/[id]/[[blade]]"]
  HOME -->|recent row click| RES
  ALL -->|row click| RES

  subgraph bladepage [Resource page]
    MENU["Blade nav"] --> OV["Overview<br/>Essentials + command bar:<br/>rename · delete · publish* · import/export*"]
    MENU --> TB["Type blades<br/>Sheet: Data · Settings<br/>Survey: Editor · Responses<br/>TodoList: Items · Calendar<br/>others: Editor (inline)"]
  end

  RES --> bladepage
  OV -->|"copy public link (published)"| VIEW["/view/[type]/[id]<br/>public, snapshot only"]
```

## Home — `/resources`

The Azure-portal landing. Not a table — a dashboard of entry points: the inline [global search](/docs/platform/global-search) mount (grouped as-you-type dropdown; Enter still routes to `/resources/all` pre-filtered), **quick-create tiles** from `ResourceDefinitionMap` (icon + title → `/resources/create/[type]`), a primary **Create a resource** button (→ gallery), and **Recent resources** (`resource.readResources` sorted by `updatedAt` desc, capped, with a **See all** link). Empty state is a `StyledEmptyState` with a Create action.

## All resources — `/resources/all`

`pages/resources/all.vue` renders the `resource` layout with `title="All"` above a `v-sheet flex-1` wrapping `ResourceListView` (`:close-to`; the blade list box passes `:is-searchable="false"` to strip the workbench) — `StyledDataTableServer` over `resource.readResources` (cross-type, owner, offset-paginated):

- Columns: type (icon + label from `ResourceDefinitionMap`), name, createdAt, updatedAt — subject to the column chooser. Publish status is deliberately **not** a list column — it is a capability surfaced per-resource on the Overview blade and as an opt-in filter pill.
- Toolbar (a fully-bordered `b-1` box, workbench only): search, group-by-type toggle, column chooser, Export CSV, Refresh, and a **close ✕** (`closeTo` → Home) — **not** a Create button. Create lives on Home; `/all` is a layer you close back to Home.
- Filter-pill row, bulk select, context menu, URL-synced filter state, and the footer count are the list workbench — see [list filters & views](/docs/platform/list-filters-and-views).
- Row click → `/resources/{id}` via `navigateTo` — the single affordance for opening a resource (the name cell is plain text, not a competing link).
- `?search=`, `?types=`, `?status=`, `?sortBy=`, and `?page=` deep-link the list, so [global search](/docs/platform/global-search) links land filtered.

## Create flow — `/resources/create` → `/resources/create/[type]`

Create is a **page per resource type**, mirroring the Azure marketplace + create blade — never a modal. The gallery shows tiles for every `ResourceDefinitionMap` entry (icon, title, description); the per-type form collects the name (`createNameSchema`) plus any type-specific initial settings (most types are name-only), calls `createResource(type, …)`, and routes to the new resource's Overview blade. The content blob is written on the first save inside an editor blade, not at create time.

## Resource page — `/resources/[id]/[[blade]]`

Azure-portal-faithful **two flex boxes** on one surface (deliberately simple — no absolute overlay, no `z-index`): a full-width **header bar** (the `resource` layout's `StyledPageHeader` — trail, resource name, storage meter) on top, then `<ResourceExplorer>` — a single `<v-sheet flex flex-1>` holding the **list box** (`ResourceExplorerList`, collapsible) and the **blade box** (`flex-1`) side by side.

```text
  Resources › All                     [▓▓▓░░ 3.2 GB of 10 GB used]  ← trail + storage meter
  Q3 Report                                                         ← page title (never a crumb)
┌───────────────┬──────────────────────────────────────────────┐
│ « Resources   │ 📄 Q3 Report | Overview   [Rename][Delete] [✕] │  ← blade box header (type + name)
│ ───────────── ├───────────────┬──────────────────────────────┤
│ 📄 Q3 Report  │ ▸ Overview     │  Essentials                  │
│ 📊 Sales      │   Data         │   Type     Sheet             │
│ 🌐 Landing…   │   Settings     │   Created  … ago  Updated 2h │
└───────────────┴───────────────┴──────────────────────────────┘
   list box (collapsible)         blade box (flex-1, owns the divider)
```

- **The list box exists only when the visitor drilled in from the list** ([breadcrumb trail](/docs/platform/breadcrumb-trail)). A resource opened from a link, a favourite or search renders the blade at full width with no rail and no divider — there is no list behind it to collapse back to, so the caret would peel back to a page the visitor never opened.
- **Collapse caret next to the list title (desktop)** — the list box header is `« Resources`; clicking `«` collapses the whole list box to a thin `shrink-0` strip containing just `»` to restore it, so the blade box simply grows to fill. No width animation math, no overlay. The collapse/restore carets are each shown only in their own state (`«` when open, `»` when collapsed).
- **Mobile-native** — on `smAndDown` (`useVDisplay`) the inline list box is removed entirely; there is no drawer — the full-width `/resources/all` page is the mobile list, reached via the blade box's Close ✕ (which peels back to `/resources/all`), so the blade box owns the full width. The blade nav collapses from the vertical rail into a dropdown (`v-menu`) whose activator shows the active blade — its caret (`mdi-chevron-up`) renders only while the menu is open. Desktop keeps the inline rail and collapsible list box unchanged.
- **Borders drawn exactly once** — no component double-draws an edge. The **blade box** spans the whole shared edge, so it is the single element carrying the list↔blade divider (`b-l` on the box itself, conditional on the list box existing, plus `b-t` under its header); its header and content are borderless there, and the list box draws no right edge. The **list box header** owns its bottom separator (`b-b`); the **blade nav** is borderless. Both headers are the shared `v-toolbar` primitive (identical native height/padding, no bespoke sizing).
- **Nested close** — the close ✕ peels back one layer: the blade box's ✕ → `/resources/all`; `/all`'s ✕ → Home. Each ✕ lives in its box's header, never on the breadcrumb's level.
- **Single unified breadcrumb** — the `resource` layout owns the only breadcrumb; the blade box has none. Vuetify components with a plain destination take `:to`; an inline `@click="navigateTo(...)"` is for logic-then-navigate actions. Declarative links use `NuxtLink`/`NuxtInvisibleLink`. Raw `<a>` is never used — see [navigation](/docs/architecture/navigation).
- **Blade box header** — type icon + `{name} | {active blade}` with the resource type as a caption line, plus the command bar and close ✕.

On a narrow viewport the two-box layout folds into a single full-width column with on-demand menus:

```mermaid
flowchart LR
  CLOSE["Close ✕<br/>blade box header"] -->|peels back| ALL["/resources/all<br/>full-width mobile list"]
  BNAV["Blade dropdown<br/>v-menu activator = active blade"] -->|open| CARET["Caret mdi-chevron-up<br/>shown only while open"]
  BNAV -->|pick blade — navigateTo| BLADE["Active blade fills full width"]
```

### Blades

The blade nav's built-in slugs come from the `ResourceBladeTypes` set (enum order **Overview** first, then **Editor** — `sort-enums` disabled so the enum stays the single ordered source of truth), followed by the type's own blades from `ResourceBladeDefinitionMap`. Editor-backed types register their inline component in `ResourceEditorComponentMap`; `BladeOutlet` renders it under `<ClientOnly><Suspense>` (VueFlow/GrapesJS can't SSR, and GrapesJS uses async setup). Blade-only types (Sheet, TodoList) have no `ResourceEditorComponentMap` entry, so their nav skips the Editor blade entirely.

| Type      | Blades after Overview                                        |
| --------- | ------------------------------------------------------------ |
| Sheet     | Data (grid editor), Settings (parse configuration form)      |
| Survey    | Editor (SurveyJS creator, inline), Responses (dataset table) |
| TodoList  | Items (todo table), Calendar (FullCalendar over this list)   |
| Dashboard | Editor (canvas incl. bind-to-data, inline)                   |
| Email     | Editor (GrapesJS, inline)                                    |
| Webpage   | Editor (GrapesJS, inline)                                    |
| Flowchart | Editor (VueFlow, inline)                                     |

- **Overview blade**: Essentials panel (type, created/updated) plus a type-specific summary slot. **Publish status + version and the public link render only for `PublishableResourceType`** — a non-publishable resource shows no status row at all.
- **Command bar** (in the blade box header): Refresh + Rename + Delete + Duplicate always; Publish/Unpublish for `PublishableResourceType`; Import/Export for `PortableResourceType` (contributed by `PortableFormatMap` entries — `deserialize` ⇒ Import, a self-contained async `export()` ⇒ Export); a trailing close ✕. Labeled buttons, group dividers, narrow-viewport `…` overflow, and the type-the-name delete guard are [resource page parity](/docs/platform/resource-page-parity).
- State via `useResource(id)` ([/docs/architecture/resources](/docs/architecture/resources)).

## Resource lifecycle

Every resource follows one lifecycle regardless of type — the type only decides which blades and capability commands appear:

```mermaid
stateDiagram-v2
  [*] --> Creating: Home/gallery → create form
  Creating --> Draft: createResource (row only, no blob yet)
  Draft --> Draft: edit blade → saveResourceContent (contentVersion++)
  Draft --> Draft: rename → updateResource
  Draft --> Published: publishResource (Publishable types) — snapshot to {id}/published/{n}
  Published --> Published: re-publish (publishVersion++)
  Published --> Draft: unpublishResource (delete publication row)
  Draft --> Deleted: deleteResource (deletedAt set)
  Published --> Deleted: deleteResource (deletedAt set, publication dropped)
  Deleted --> Draft: restoreResource
  Deleted --> [*]: purgeResource (blob dir, partitions, row)
```

**Create → first write.** `createResource` writes only the Postgres identity row; the content blob does not exist until the first `saveResourceContent` inside an editor blade — no half-written blob to reconcile.

**Update = one write path.** Settings and Data are separate blades but one content blob with one `contentVersion` — never two write paths for one artifact. Optimistic concurrency: a stale `contentVersion` rejects the save.

**Linking to other resources** is the dataset capability ([/docs/architecture/datasets](/docs/architecture/datasets)), not a resource-to-resource foreign key: a consumer holds a `DatasetReference` (`{ type, id }`) and either copies (Sheet import — one-time row copy) or references (Dashboard visual / Email merge fields — re-resolved on load via `dataset.readDataset`).

**Delete.** `deleteResource` is a soft delete — identical for every type: it stamps `deletedAt` and drops the `resource_publications` row, while the `{id}/` blob directory and the type's table partitions survive so a restore can hand the whole resource back. `purgeResource` is what destroys them, from the bin or from the 30-day timer ([recycle bin](/docs/platform/recycle-bin)). Because links are bare `DatasetReference` ids (not FKs), deleting a source leaves consumers' stored references dangling; the consumer re-resolves on load and fails/returns empty rather than cascading. Published snapshots are unaffected (they baked data in at publish time). Surfacing a "source no longer available" state is deferred ([dangling dataset references](/docs/platform/deferred/dangling-dataset-references)).

## Key files

| File                                                  | Role                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `app/pages/resources/[id]/[[blade]].vue`              | resource page shell: `useResource`, 404-guards id + blade, breadcrumb + `<ResourceExplorer>`                           |
| `app/components/Resource/Explorer/Index.vue`          | the two-flex-box body (list box \| blade box); on mobile drops the list box so the blade takes the whole surface       |
| `app/components/Resource/Explorer/List.vue`           | desktop-only collapsible list box (owns `isListCollapsed`); on mobile the full-width `/resources/all` page is the list |
| `app/components/Resource/List/View.vue`               | `StyledDataTableServer` over `resource.readResources` (shared by `/all` — the workbench)                               |
| `app/components/Resource/Blade/Toolbar.vue`           | blade box header composing `BladeTitle` + `BladeActions`                                                               |
| `app/components/Resource/Blade/Actions.vue`           | command bar: refresh, rename, delete, duplicate, `PublishToggle`, `PortableActions`, `…` overflow, close ✕             |
| `app/components/Resource/Blade/Nav.vue`               | blade menu from `ResourceBladeTypes` + type blades; desktop rail, mobile dropdown (`v-menu`, caret only while open)    |
| `app/components/Resource/Blade/Outlet.vue`            | Overview vs inline editor vs type blade on the active slug                                                             |
| `app/components/Resource/Overview.vue`                | generic Overview blade (Essentials + type summary slot)                                                                |
| `app/services/resource/ResourceBladeDefinitionMap.ts` | type → its own blade definitions                                                                                       |
| `app/services/resource/ResourceEditorComponentMap.ts` | type → inline Editor-blade component                                                                                   |
| `app/services/resource/PortableFormatMap.ts`          | portable type → formats (Import/Export)                                                                                |
| `app/services/resource/ViewComponentMap.ts`           | publishable type → public view renderer                                                                                |
| `app/composables/resource/useResource.ts`             | row + typed content + save/capability actions                                                                          |

## Notes

- The shell reuses the [shell cohesion](/docs/platform/shell-cohesion) primitives; styling follows the `styling`/`vuetify` skills.
- **One list mechanism**: the explorer replaced `DocumentPicker`, the surveyer CRUD list, and the documents hub — no per-editor pickers survive. Home recents and `/resources/all` are both `resource.readResources` (different sort/limit), not two data paths.
- **One create mechanism**: the gallery + per-type form replaced every per-editor "new" button and modal. Create is a page (marketplace parity), never a dialog.
- **Editors are pure editors.** The resource lifecycle (create / select / rename / delete / publish) lives only in the Explorer + Overview blade — never in an editor's header. Editor headers keep only editing tools; editors save independently (autosave / edit-dialog).
- **The layout's header bar is the only `StyledPageHeader` on the page.** A blade's own header is a plain `v-toolbar` (`Resource/Email/Editor.vue`, `Dashboard/Editor/Header.vue`) — a nested `StyledPageHeader` would render a second breadcrumb trail and a second storage meter.
- Deleted routes: `/documents`, `/table-editor`, `/surveyer`, `/surveyer/[id]`, `/survey/[id]`, `/dashboard`, `/dashboard/editor`, `/email-editor`, `/webpage-editor`, `/flowchart-editor`, `/calendar`, `/view/dashboard/[id]`, `/view/webpage/[id]`.
