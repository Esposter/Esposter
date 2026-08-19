---
title: Shell Cohesion
description: The shared chrome primitives — page header, breadcrumbs, empty/loading states, and the launcher — that make the platform read as one product.
---

# Shell Cohesion

One consistent chrome across every product: a shared page header, shared empty/loading primitives, breadcrumbs, and a trimmed launcher — so the platform reads as one product instead of five editors that each rolled their own toolbar. The [Resource Explorer](/docs/platform/resource-explorer) builds on these primitives.

## Components

Shell primitives live in `app/components/Styled/` (design-system set) and `app/components/App/` (app-chrome), one export per file.

- `StyledPageHeader` — the canonical page header. A `v-toolbar` (surface, `height="auto"`) laying out flex rows — the breadcrumb trail with a right-aligned `status` slot for a standing readout, then the page title beside a right-aligned `actions` slot, then an optional `filters` row — never inside `v-toolbar-title`. The trail row is where a persistent number belongs: the trail rarely fills a line, so anything parked on the title row instead pays a row of its own for width already going spare. The title row renders only when there is a title or actions, so a page named by its own content ([resource explorer](/docs/platform/resource-explorer)) costs no empty row.
- `StyledEmptyState` — icon + title + description + optional action slot, for "no resources yet" / "no rows" / "not bound to data" states.
- `StyledSkeleton` — thin `v-skeleton-loader` wrapper with the project's bordered-card preset, for per-region loading (instead of relying on the single global `AppLoadingIndicator`).
- `StyledKeyboardShortcutsDialog` — the shared shortcuts help dialog (category groups + `kbd` chips over a `KeyboardShortcutCategory[]` prop); bound to the messaging shortcuts dialog and the resource explorer's `Resource/ShortcutsOverlay`.
- `AppBreadcrumbs` — renders the area hub followed by the pages the visitor actually came through, never the page they are on, so a direct arrival still has its way out ([breadcrumb trail](/docs/platform/breadcrumb-trail)); rendered by `StyledPageHeader`, not the global app bar, so it carries page context and never duplicates.
- `AppMenuLinkListItem` — a single launcher leaf (extracted from `MenuLinkList` so leaves render identically at top level and inside a group).

## Navigation

- `ListLinkItem` carries `children?: readonly ListLinkItem[]`. `MenuLinkList` renders a child-bearing item as a `v-list-group`; leaves go through `MenuLinkListItem`.
- `ProductListLinkItems`: one **Resources** entry covers every resource type rather than one entry per editor; Clicker + Dungeons live under a "Games" group. `ProductList` (home/login drawer) reuses `MenuLinkList` so both surfaces stay in sync.
- The app bar's `#append` cluster (`AppBar`) orders the app launcher (nine-dot `mdi-dots-grid`) first, then the theme toggle, the notification bell, and the More/account menu last — the launcher leads so the product grid is the first affordance, and the bell sits directly beside the More menu.

## Key files

| File                                       | Role                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `app/components/Styled/PageHeader.vue`     | shared page header (breadcrumbs + status, title + actions, filters)  |
| `app/components/Styled/EmptyState.vue`     | shared empty state                                                   |
| `app/components/Styled/Skeleton.vue`       | shared skeleton loader                                               |
| `app/components/App/Breadcrumbs.vue`       | navigation-derived breadcrumb trail rendered by `PageHeader`         |
| `app/components/App/Menu/LinkListItem.vue` | launcher leaf, reused by group + top level                           |
| `app/services/app/ProductListLinkItems.ts` | launcher data (Resources entry + Games group)                        |
| `app/models/shared/ListLinkItem.ts`        | `children` field for submenus                                        |
| `app/components/App/Bar.vue`               | top app bar; `#append` button order (launcher · theme · bell · more) |

## Notes

- Styling follows the `styling` skill (UnoCSS attributify, `flex` not `d-flex`) and `vuetify` skill (typed select items, `v-btn` tooltips). Header layout uses flex rows, not nested `v-toolbar-title`.
- Additive and incremental: each surface adopts `PageHeader` independently; nothing breaks if one lags.
