---
title: Shell Cohesion
description: The shared chrome primitives — page header, breadcrumbs, empty/loading states, and the launcher — that make the platform read as one product.
---

# Shell Cohesion

One consistent chrome across every product: a shared page header, shared empty/loading primitives, breadcrumbs, and a trimmed launcher — so the platform reads as one product instead of five editors that each rolled their own toolbar. The [Resource Explorer](/docs/resource/explorer) builds on these primitives.

## Components

Shell primitives live in `app/components/Styled/` (design-system set) and `app/components/App/` (app-chrome), one export per file.

- `StyledPageHeader` — the canonical page header. A `v-toolbar` (surface, `height="auto"`) laying out flex rows — the breadcrumb trail with a right-aligned `status` slot for a standing readout, then the page title beside a right-aligned `actions` slot, then an optional `filters` row — never inside `v-toolbar-title`. The trail row is where a persistent number belongs: the trail rarely fills a line, so anything parked on the title row instead pays a row of its own for width already going spare. The title row renders only when there is a title or actions, so a page named by its own content ([resource explorer](/docs/resource/explorer)) costs no empty row.
- `StyledEmptyState` — icon + title + description + optional action slot, for "no resources yet" / "no rows" / "not bound to data" states.
- `StyledSkeleton` — thin `v-skeleton-loader` wrapper with the project's bordered-card preset, for per-region loading (instead of relying on the page loading bar, `AppLoadingIndicator`).
- `AppBreadcrumbs` — renders the area hub followed by the pages the visitor actually came through, never the page they are on, so a direct arrival still has its way out ([breadcrumb trail](/docs/resource/breadcrumb-trail)); rendered by `StyledPageHeader`, not the dock, so it carries page context and never duplicates.

## Navigation

- `ProductGroups`: the launcher's products, grouped by what they are for. One **Resource Explorer** entry covers every resource type rather than one entry per editor; Clicker and Dungeons are the "Play" group. `AppProductGroups` draws them in the launcher, the one list of products.
- The frame itself — the dock, its launcher, bookmarks and recent pages, the account menu and the toasts — is the [UI library's app shell](/docs/architecture/ui-library#app-shell).

## Key files

| File                                   | Role                                                                |
| -------------------------------------- | ------------------------------------------------------------------- |
| `app/components/Styled/PageHeader.vue` | shared page header (breadcrumbs + status, title + actions, filters) |
| `app/components/Styled/EmptyState.vue` | shared empty state                                                  |
| `app/components/Styled/Skeleton.vue`   | shared skeleton loader                                              |
| `app/components/App/Breadcrumbs.vue`   | navigation-derived breadcrumb trail rendered by `PageHeader`        |
| `app/components/App/ProductGroups.vue` | the products, grouped, drawn in the launcher                        |
| `app/services/app/ProductGroups.ts`    | launcher data, by group                                             |

## Notes

- Styling follows the `styling` skill (UnoCSS attributify, `flex` not `d-flex`) and `vuetify` skill (typed select items, `v-btn` tooltips). Header layout uses flex rows, not nested `v-toolbar-title`.
- Additive and incremental: each surface adopts `PageHeader` independently; nothing breaks if one lags.
