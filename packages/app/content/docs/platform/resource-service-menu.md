---
title: Resource service menu
description: Home's hamburger drawer for the resource area — All, Favorites, Recent, Tags and the recycle bin as sibling routes over one list surface.
---

# Resource service menu

The portal this explorer follows does not put "everything you own" behind a single page. Resource Manager is a **service** with a menu, and each entry opens the _same_ list surface pointed at a different set. One list page with the rest as cards on Home is the shape that does not scale: Recent and Favorites cannot grow filters, columns, sorting or bulk selection without re-implementing what `/all` already has.

The menu makes each entry a view over the existing list, so a capability built once appears everywhere.

```mermaid
flowchart LR
  MENU["ResourceServiceMenu<br/>Home's ☰ drawer"] --> HOME["Home<br/>/resource-explorer"]
  MENU --> ALL["All<br/>/resource-explorer/all"]
  MENU --> FAV["Favorites<br/>/resource-explorer/favorites"]
  MENU --> REC["Recent<br/>/resource-explorer/recents"]
  MENU --> TAGS["Tags<br/>/resource-explorer/tags"]
  MENU --> BIN["Recycle bin<br/>/resource-explorer/recycle-bin"]
  ALL --> LIST["ResourceListView<br/>filters · columns · grouping · selection · export"]
  FAV --> LIST
  REC --> LIST
  TAGS --> TAGLIST["tag list — name + resource count"]
  TAGLIST -->|"click a tag"| ALL
  LIST -->|"row click"| BLADE["resource blade"]
```

## One surface, three sets

`ResourceListView` takes a `source` prop, and `ResourceListSourceDefinitionMap` says what each source means: a filter preset merged into every read, a default sort, an empty state, an icon, and optionally the column the view is ordered by. Nothing else differs between the three list routes.

The filter preset is the whole mechanism. `resource.readResources` gained `isFavorite` and `isAccessed` booleans, both resolved as caller-scoped `EXISTS` subqueries inside the same `createResourcesWhere` every other filter goes through — so Favorites and Recent inherit the pill row, the URL-synced filter state, the row count and the summary cards for free, and none of them can disagree with `/all` about what a filter means.

| Source      | Filter             | Default sort          | Pinned column    |
| ----------- | ------------------ | --------------------- | ---------------- |
| `All`       | —                  | updated, newest first | —                |
| `Favorites` | `isFavorite: true` | updated, newest first | —                |
| `Recents`   | `isAccessed: true` | opened, newest first  | `lastAccessedAt` |

**Favorites deliberately does not sort starred-first.** The star's own timestamp is not a column any list shows, and a list ordered by a value the reader cannot see reads as arbitrary. Recent is the opposite case, so it pins the column it sorts by — see the column chooser in [list filters & views](/docs/platform/list-filters-and-views) for what pinning means.

Recent is server-side rather than per-device for the same reason it pins the column it sorts by — [favorites & recents](/docs/platform/favorites-and-recents) has the reasoning.

## What we deliberately did not copy

The Tags entry is the one genuinely new read — a grouped count over tag names, described in [resource tags](/docs/platform/tags). It exists **instead of** a Groups entry: a portal group is a containment relationship and our resources have no container, so resource groups stay [deferred](/docs/platform/deferred/resource-groups) and tags carry the many-to-many grouping people actually want. Subscriptions, locations and deployments are likewise portal concepts with nothing behind them here — copying the menu's shape must not mean copying its vocabulary.

## Where the menu renders

**Home only, as a drawer behind a hamburger.** The `resource` layout takes `is-service-menu-shown`, and `/resource-explorer` is the one route that passes it. Home is where a reader decides which set to open; every other route in the area is already inside an answer to that question, and the list pages in particular are the widest thing here — a rail standing open would take that width permanently to serve six links reached a few times a session.

The `☰` sits beside the breadcrumb trail, on the same row as the storage meter, since both are the layout's own chrome rather than any page's. The drawer opens over the content with **no scrim**, so Home stays readable and clickable while it is open, and closes again on the entry that was picked. Nothing about it is persisted: navigation is the drawer's whole purpose, so it has no reason to outlive the trip.

The drawer is `StyledNavDrawer` and behaves identically at every breakpoint — a hamburger is already the narrow-viewport shape, so there is no second behaviour to keep in step. It is deliberately **not** the blade nav's `StyledCollapsibleNav`: a blade rail is used constantly while reading one resource and stays on screen, which is a different rule and so a different shell. Active entries are matched **exactly** — Home is a path prefix of every other entry, so a prefix match would leave it lit on every page in the area.

Home keeps its Recent and Favorites card. The card and the routes are the same two sets at two sizes, so both take a `source` and read that source's icon and empty-state copy from `ResourceListSourceDefinitionMap` — a set is described identically wherever it renders.

## Key files

Paths relative to `packages/app`.

| File                                                            | Role                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `app/components/Resource/ServiceMenu.vue`                       | the entries and their exact-path active matching                 |
| `app/components/Styled/NavDrawer.vue`                           | the drawer shell — slide-in, elevated, scrimless                 |
| `app/layouts/resource.vue`                                      | owns the `☰`, the open state and where the drawer mounts        |
| `app/components/Resource/List/View.vue`                         | the one list surface, parameterised by `source`                  |
| `app/services/resource/list/ResourceListSourceDefinitionMap.ts` | what each source filters, sorts and pins                         |
| `app/components/Resource/TagList.vue`                           | the Tags entry's list                                            |
| `../db-schema/src/schema/resourceAccesses.ts`                   | one row per user per resource, holding the last open             |
| `server/trpc/routers/resource.ts`                               | `isFavorite`/`isAccessed` filters, `recordAccess`, `countsByTag` |
