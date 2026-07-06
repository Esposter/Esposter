# Platform — Shell Cohesion

One consistent chrome across every product: a shared page header, shared empty/loading primitives, breadcrumbs, a trimmed launcher, and a unified documents hub — so the platform reads as one product instead of five editors that each rolled their own toolbar.

## Overview

Today each editor builds its own bare `v-toolbar`; the table editor even stacks the document picker, type select, search, and action buttons _inside_ `v-toolbar-title`, so controls render crammed in the middle. There is no shared page-header, empty-state, or skeleton component, no breadcrumbs, and the launcher is a flat 10-item list. This spec introduces the shared shell and adopts it everywhere.

## Components

Shell primitives live in `app/components/Styled/` (design-system set) and `app/components/App/` (app-chrome), one export per file.

- `Styled/PageHeader.vue` — the canonical editor header. A `v-toolbar` (surface, `height="auto"`) laying out two flex rows — a breadcrumb row (default `AppBreadcrumbs`, with a right-aligned `actions` slot) and a `controls` row (document picker, selects, search) — never inside `v-toolbar-title`. `title` prop feeds the current-page breadcrumb. Adopted by the table/dashboard/email/webpage/surveyer editor headers.
- `Styled/EmptyState.vue` — icon + title + description + optional action slot, for "no documents yet" / "no rows" / "not bound to data" states.
- `Styled/Skeleton.vue` — thin `v-skeleton-loader` wrapper with the project's bordered-card preset, for per-region loading (replaces reliance on the single global `AppLoadingIndicator`).
- `App/Breadcrumbs.vue` — derives the trail from the current route matched against `ProductListLinkItems` (route paths are kebab, so `prettify` won't do — product titles come from the launcher data); rendered by `PageHeader`, not the global app bar, so it carries page context and never duplicates.
- `App/MenuLinkListItem.vue` — a single launcher leaf (extracted from `MenuLinkList` so leaves render identically at top level and inside a group).

## Navigation

- `ListLinkItem` gains `children?: readonly ListLinkItem[]`. `MenuLinkList` renders a child-bearing item as a `v-list-group`; leaves go through `MenuLinkListItem`.
- `ProductListLinkItems`: productivity tools stay flat (Messages, Calls, Table, Dashboard, Email, Webpage, Flowchart, Surveyer); Clicker + Dungeons move under a "Games" group. `ProductList` (home/login drawer) reuses `MenuLinkList` so both surfaces stay in sync.
- Calendar is **not** a launcher item — the table editor header shows a Calendar affordance for the TodoList type (`RoutePath.Calendar`), which renders the existing TodoList calendar over the shared store.

## Unified Documents Hub

- `pages/documents.vue` (`RoutePath.Documents`, `auth`) — one list of the owner's documents across every `DocumentType`, with a type icon, published/draft status, and updated-at. Row (or the Open action) → the owning editor deep-linked via `?documentId=`.
- Cross-type list procedure `document.readDocuments` (owner, offset-paginated over the `documents` table, all types), resolved by `DocumentTypeRoutePathMap` / `DocumentTypeIconMap`.
- `useDocumentState.load()` honours the `documentId` query param (selects that document, else the most recent) — one change wires deep-linking for every editor.
- Surveys stay on their own table and remain managed in Surveyer for now; unioning them into the hub is deferred (server pagination across two tables).

## Key Files

| File                                       | Role                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| `app/components/Styled/PageHeader.vue`     | shared editor header (title + breadcrumbs/controls/actions) |
| `app/components/Styled/EmptyState.vue`     | shared empty state                                          |
| `app/components/Styled/Skeleton.vue`       | shared skeleton loader                                      |
| `app/components/App/Breadcrumbs.vue`       | route-derived breadcrumb trail rendered by `PageHeader`     |
| `app/components/App/MenuLinkListItem.vue`  | launcher leaf, reused by group + top level                  |
| `app/services/app/ProductListLinkItems.ts` | launcher data (flat tools + Games group)                    |
| `app/models/shared/ListLinkItem.ts`        | `children` field for submenus                               |
| `pages/documents.vue`                      | unified cross-editor documents hub                          |

## Constraints / Notes

- Styling follows the `styling` skill (UnoCSS attributify, `flex` not `d-flex`) and `vuetify` skill (typed select items, `v-btn` tooltips). Header layout uses flex rows, not nested `v-toolbar-title`.
- Additive and incremental: each editor adopts `PageHeader` independently; nothing breaks if one lags.
- Documentation stays live — this spec and `/architecture/platform.md` update in the same change as each phase lands (see `feature-workflow` phase 5).
