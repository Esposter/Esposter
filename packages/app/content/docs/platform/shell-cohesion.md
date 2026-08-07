---
title: Shell Cohesion
description: The shared chrome primitives — page header, breadcrumbs, empty/loading states, and the launcher — that make the platform read as one product.
---

# Shell Cohesion

One consistent chrome across every product: a shared page header, shared empty/loading primitives, breadcrumbs, and a trimmed launcher — so the platform reads as one product instead of five editors that each rolled their own toolbar. The [Resource Explorer](/docs/platform/resource-explorer) builds on these primitives.

## Components

Shell primitives live in `app/components/Styled/` (design-system set) and `app/components/App/` (app-chrome), one export per file.

- `Styled/PageHeader.vue` — the canonical page header. A `v-toolbar` (surface, `height="auto"`) laying out flex rows — the breadcrumb trail, then the page title beside a right-aligned `actions` slot, then an optional `filters` row — never inside `v-toolbar-title`.
- `Styled/EmptyState.vue` — icon + title + description + optional action slot, for "no resources yet" / "no rows" / "not bound to data" states.
- `Styled/Skeleton.vue` — thin `v-skeleton-loader` wrapper with the project's bordered-card preset, for per-region loading (instead of relying on the single global `AppLoadingIndicator`).
- `Styled/KeyboardShortcutsDialog.vue` — the shared shortcuts help dialog (category groups + `kbd` chips over a `KeyboardShortcutCategory[]` prop); bound to the messaging shortcuts dialog and the resource explorer's `Resource/ShortcutsOverlay`.
- `App/Breadcrumbs.vue` — renders the pages the visitor actually came through, never the page they are on, and nothing at all on a direct arrival ([breadcrumb trail](/docs/platform/breadcrumb-trail)); rendered by `PageHeader`, not the global app bar, so it carries page context and never duplicates.
- `App/Menu/LinkListItem.vue` — a single launcher leaf (extracted from `MenuLinkList` so leaves render identically at top level and inside a group).

## Navigation

- `ListLinkItem` carries `children?: readonly ListLinkItem[]`. `MenuLinkList` renders a child-bearing item as a `v-list-group`; leaves go through `MenuLinkListItem`.
- `ProductListLinkItems`: one **Resources** entry replaces the old per-editor entries; Clicker + Dungeons live under a "Games" group. `ProductList` (home/login drawer) reuses `MenuLinkList` so both surfaces stay in sync.
- The app bar's `#append` cluster (`App/Bar.vue`) orders the app launcher (nine-dot `mdi-dots-grid`) first, then the theme toggle, the notification bell, and the More/account menu last — the launcher leads so the product grid is the first affordance, and the bell sits directly beside the More menu.

## Key files

| File                                       | Role                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `app/components/Styled/PageHeader.vue`     | shared page header (title + breadcrumbs/controls/actions)            |
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
