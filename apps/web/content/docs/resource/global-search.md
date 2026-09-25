---
title: Global Search
description: Azure-portal-faithful resource-explorer search — the command palette's resources scope on the explorer home page, grouped as it is typed, opened from a field-shaped button on Home, keyboard chords, and prefix-match ranking.
---

# Global Search

Azure-portal-faithful search over the Resource Explorer: an as-you-type search grouped into Resources / Services / Pages, which is the [command palette](/docs/architecture/command-palette)'s scope while the explorer home page (`pages/resource-explorer/index.vue`) is open, so `Ctrl+K` there searches resources. Home leads with a button drawn as the field it opens (portal landing parity), as the docs' search is, rather than a second search of its own. No new backend — the Resources group rides `resource.readResources`, which ranks prefix matches first.

## How it works

```mermaid
flowchart LR
  HOME["Home's search button"] --> DLG["The palette, in the Resources scope"]
  CK["Ctrl+K / G /<br/>(explorer home)"] --> DLG
  DLG --> SM["useResourceSearchItems"]

  SM -->|"query (useAutoSearch throttle)"| RR["resource.readResources<br/>{ searchQuery, limit: 5 }"] --> RG["Resources group"]
  SM -->|client substring| RDM["ResourceDefinitionMap +<br/>ResourceTypeDescriptionMap"] --> SG["Services group"]
  SM --> PG["Pages group (static)"]
  SM -->|empty query| LS["LocalStorageKey.ResourceRecentSearches<br/>(per-device)"]
  SM -->|empty query| ACC["resource_accesses<br/>Recently opened, server-side"]

  RG -->|Enter/click| RES["/resource-explorer/[id]"]
  SG --> ALLT["/resource-explorer/all?types=X"]
  SG -->|Create sub-action| CT["/resource-explorer/create/[type]"]
  SM -->|"See all results →"| ALL["/resource-explorer/all?search=q"]
```

With a query set the scope shows three groups plus a last row:

| Group     | Source                                                                 | Row                                  | Target                                                                                   |
| --------- | ---------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| Resources | `resource.readResources { searchQuery, limit: 5 }` via `useAutoSearch` | type icon · name · type caption      | `RoutePath.Resource(id)`                                                                 |
| Services  | client-side match over type titles + descriptions                      | type icon · title, then a Create row | `/resource-explorer/all?types=X`; Create → `/resource-explorer/create/[type]`            |
| Pages     | static `PageSearchItems`                                               | page icon · title                    | every [service menu](/docs/resource/resource-service-menu) entry, plus Create a resource |
| last row  | always when a query is set                                             | "See all results for {q}"            | `/resource-explorer/all?search={q}`                                                      |

- **Empty query**: two groups instead — recent searches (`LocalStorageKey.ResourceRecentSearches`, capped at 5, pushed on submit/pick) and **Recently opened**, the caller's own server-side access rows read through the recents store ([favorites & recents](/docs/resource/favorites-and-recents)). The two are stored differently on purpose ([favorites & recents](/docs/resource/favorites-and-recents) says why): the resources you opened follow you between machines; a query you typed does not.
- **No match highlight**: the palette draws its rows the one way for every scope.
- **No results**: the See-all row alone.
- `/resource-explorer/all` reads `?search=` and `?types=` on load, so the See-all and Services rows deep-link into a pre-filtered list.

## Keyboard

- The palette's own keyboard contract walks the rows: it highlights the first whenever the list changes, so `Enter` takes the best match, and the arrows walk the rest.
- `useResourceCommands`, called by the explorer home page, registers the same search as the palette's scope — the rows as palette commands, each service's Create sub-action as a row of its own, and See all as the last — and the Azure `G`-chords as commands: `G /` opens the palette on resources, `G A` goes to `/resource-explorer/all`, and `G N` opens the [notifications](/docs/resource/notifications) panel. Picking a row remembers the query as a recent search.
- The chords are bound through the command registry, so they never fire in a field, and `Shift+?` lists them in the app's one shortcuts dialog while the page is open.

## Relevance

`readResources` ranks the closest trigram match first, then prefix matches above the remaining substring matches, newest-first within each tier. The search value is escaped and bound through the query builder throughout, and `getResourcesWhere` stays the single filter source so `readResourcesCount` never drifts from the list. Typo tolerance and the ranking ladder are covered in [global search relevance](/docs/resource/global-search-relevance); Azure AI Search stays [deferred](/docs/resource/deferred/azure-ai-search).

## Key files

| File                                                        | Role                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `app/pages/resource-explorer/index.vue`                     | explorer home — the search button, and the page whose commands and scope are registered  |
| `app/components/App/SearchButton.vue`                       | the button drawn as the field it opens, shared with the docs                             |
| `app/composables/resource/search/useResourceSearchItems.ts` | grouping and recent-search persistence over [`useAutoSearch`](/docs/architecture/search) |
| `app/composables/resource/useRecordResourceAccess.ts`       | records the open from the resource page, feeding the Recently opened group               |
| `app/composables/resource/useResourceCommands.ts`           | the palette's Resources scope and the `G`-chords, registered with the explorer home page |
| `app/services/resource/search/`                             | pure grouping and recents helpers (`getServiceSearchItems`, `pushRecent`, …)             |
| `server/trpc/routers/resource.ts`                           | prefix-match ranking in `readResources`                                                  |

## Notes

- One search, one surface — `useResourceSearchItems` feeds the palette's scope, and Home's button opens it rather than keeping a dropdown of its own ([command palette](/docs/architecture/command-palette)).
- Explorer-scoped, not app chrome — the scope exists only while the explorer home page is open; elsewhere the palette searches the whole app.
- The Services group answers "search matches type names" client-side ("survey" surfaces the Survey service row) — pushing type-title matching into the server `where` was rejected; the client already knows `ResourceDefinitionMap`. The Services and Pages groups rank their small registries through `searchItems`, the repo's one client-side index ([search](/docs/architecture/search)), never server work.
- Recent searches are per-device by design (localStorage); server-side search history is not worth a table. Recently opened resources are the opposite: they live server-side in `resource_accesses`, because the `Last accessed` column they feed has to agree between machines.
