---
title: Shell Cohesion
description: The shared chrome primitives — page header, breadcrumbs, empty/loading states, and the launcher — that make the platform read as one product.
---

# Shell Cohesion

One consistent chrome across every product: a shared page header, shared empty/loading primitives, breadcrumbs, and a trimmed launcher — so the platform reads as one product instead of five editors that each rolled their own toolbar. The [Resource Explorer](/docs/resource/explorer) builds on these primitives.

## Components

Shell primitives live in `app/components/Ui/` (the UI library) and `app/components/App/` (app-chrome), one export per file.

- The page header — the `resource` layout's, on the UI library, with no surface of its own: the breadcrumb trail with a standing readout at its far end, then the page's title or a `heading` slot for a title row that carries more (a resource's type and commands), then a `navigation` slot for the page's sections as tab links. The trail row is where a persistent number belongs: the trail rarely fills a line, so anything parked on the title row instead pays a row of its own for width already going spare.
- `UiEmptyState` — a mark named by its meaning, a title, an optional description and at most one action in its slot, for "no resources yet" / "no rows" / "not bound to data" states; `UiErrorState` is the same shape for a failed read, with its retry button.
- `UiSkeleton` — a decorative block the caller sizes, standing in for per-region loading (instead of relying on the page loading bar, `AppLoadingIndicator`).
- `AppBreadcrumbs` — renders the area hub followed by the pages the visitor actually came through, never the page they are on, so a direct arrival still has its way out ([breadcrumb trail](/docs/resource/breadcrumb-trail)); rendered by the page header, not the dock, so it carries page context and never duplicates.

## Navigation

- `ProductGroups`: the launcher's products, grouped by what they are for. One **Resource Explorer** entry covers every resource type rather than one entry per editor; Clicker and Dungeons are the "Play" group. `AppProductGroups` draws them in the launcher, the one list of products.
- The frame itself — the dock, its launcher, bookmarks and recent pages, the account menu and the toasts — is the [UI library's app shell](/docs/architecture/ui-library#app-shell).

## Key files

| File                                   | Role                                                            |
| -------------------------------------- | --------------------------------------------------------------- |
| `app/layouts/resource.vue`             | the page header: trail and status, title, the page's sections   |
| `app/components/Ui/EmptyState.vue`     | shared empty state                                              |
| `app/components/Ui/Skeleton.vue`       | shared skeleton loader                                          |
| `app/components/App/Breadcrumbs.vue`   | navigation-derived breadcrumb trail rendered by the page header |
| `app/components/App/ProductGroups.vue` | the products, grouped, drawn in the launcher                    |
| `app/services/app/ProductGroups.ts`    | launcher data, by group                                         |

## Notes

- Styling follows the `styling` skill (UnoCSS attributify, `flex` not `d-flex`) and `ui-library` skill (an icon button's label is its tooltip). Header layout uses flex rows.
