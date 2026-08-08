---
title: Global Search
description: Azure-portal-faithful resource-explorer search — grouped as-you-type dropdown, Ctrl+K command palette on the explorer home page, keyboard chords, and prefix-match ranking.
---

# Global Search

Azure-portal-faithful search over the resource platform: one `ResourceSearchMenu` combobox with an as-you-type dropdown grouped into Resources / Services / Pages, mounted inline on Home (portal landing parity) and as a `Ctrl+K` command-palette dialog, both from the explorer home page (`pages/resource-explorer/index.vue`) — the app bar is cross-product chrome (messaging, posts, games), so it carries no resource-search entry. No new backend — the Resources group rides `resource.readResources`, which ranks prefix matches first.

## How it works

```mermaid
flowchart LR
  HOME["Home inline mount"] --> SM["ResourceSearchMenu"]
  CK["Ctrl+K / G /<br/>(explorer home)"] --> DLG["ResourceSearchDialog"] --> SM

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

With a query set the dropdown shows three groups plus a footer:

| Group     | Source                                                                 | Row                                     | Target                                                                                   |
| --------- | ---------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Resources | `resource.readResources { searchQuery, limit: 5 }` via `useAutoSearch` | type icon · name · type caption         | `RoutePath.Resource(id)`                                                                 |
| Services  | client-side match over type titles + descriptions                      | type icon · title · "Create" sub-action | `/resource-explorer/all?types=X`; Create → `/resource-explorer/create/[type]`            |
| Pages     | static `PageSearchItems`                                               | page icon · title                       | every [service menu](/docs/platform/resource-service-menu) entry, plus Create a resource |
| footer    | always when a query is set                                             | "See all results →"                     | `/resource-explorer/all?search={q}`                                                      |

- **Empty query**: two groups instead — recent searches (`LocalStorageKey.ResourceRecentSearches`, capped at 5, pushed on submit/pick) and **Recently opened**, the caller's own server-side access rows read through `useReadRecentResources` ([favorites & recents](/docs/platform/favorites-and-recents)). The two are stored differently on purpose: a query you typed is not something to follow you between machines, while the resources you opened are.
- **Match highlight**: the matched substring is bolded in row titles (`ResourceSearchHighlightedTitle` over `getHighlightParts`).
- **No results**: a single "No resources found for '{q}'" row plus the See-all footer.
- `/resource-explorer/all` reads `?search=` and `?types=` on load, so the footer and Services rows deep-link into a pre-filtered list.

## Keyboard

- `Ctrl+K` opens the dialog mount on the explorer home page; `Esc` closes; `↑`/`↓` move through a flat list across groups (the See-all footer is the last option); `Enter` activates the selection, falling back to See-all when nothing is selected. The dialog mount traps focus (Vuetify dialog); the inline Home mount keeps normal document tab order.
- ARIA: the field is `role="combobox"` with `aria-expanded`/`aria-activedescendant`; the panel is `role="listbox"` with `role="option"` rows.
- Azure `G`-chords via `useResourceKeyboardShortcuts` (registered from the explorer home page): `G /` focuses search (opens the palette), `G A` → `/resource-explorer/all`. Chords are suppressed while focus is in an input/editor (`checkIsEditableTarget`).
- `?` opens `ResourceShortcutsOverlay`, a `StyledKeyboardShortcutsDialog` listing all bindings (`ResourceKeyboardShortcutList`).
- The messaging area keeps its own `Ctrl+K` room palette and `Shift+?` dialog; because the resource handlers only exist on the explorer home page, no route carve-out is needed.

## Relevance

`readResources` ranks the closest trigram match first, then prefix matches above the remaining substring matches, newest-first within each tier. The search value is escaped and bound through the query builder throughout, and `createResourcesWhere` stays the single filter source so `count` never drifts from the list. Typo tolerance and the ranking ladder are covered in [global search relevance](/docs/platform/global-search-relevance); Azure AI Search stays [deferred](/docs/platform/deferred/azure-ai-search).

## Key files

| File                                                        | Role                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `app/components/Resource/Search/Menu.vue`                   | the combobox + panel (single source for both mounts); keyboard nav, select bookkeeping   |
| `app/components/Resource/Search/ResultList.vue`             | grouped listbox rows, Create sub-action, See-all footer                                  |
| `app/components/Resource/Search/HighlightedTitle.vue`       | bolds the matched substring in row titles                                                |
| `app/components/Resource/Search/Dialog.vue`                 | `Ctrl+K` overlay mount (`v-dialog` bound to `useSearchDialogStore`)                      |
| `app/components/Resource/ShortcutsOverlay.vue`              | `?` shortcuts help dialog                                                                |
| `app/pages/resource-explorer/index.vue`                     | explorer home — inline mount plus the dialog/overlay mounts and keyboard chords          |
| `app/composables/resource/search/useResourceSearchItems.ts` | grouping and recent-search persistence over [`useAutoSearch`](/docs/architecture/search) |
| `app/composables/resource/useRecordResourceAccess.ts`       | records the open from the resource page, feeding the Recently opened group               |
| `app/composables/resource/useResourceKeyboardShortcuts.ts`  | `Ctrl+K`, `G`-chords, `?` — keydown listener mounted with the explorer home page         |
| `app/services/resource/search/`                             | pure grouping/highlight/recents helpers (`getServiceSearchItems`, `pushRecent`, …)       |
| `server/trpc/routers/resource.ts`                           | prefix-match ranking in `readResources`                                                  |

## Notes

- One component, two mounts — never two search implementations (Home vs overlay).
- Explorer-scoped, not app chrome — the app bar spans every product area, so it carries no resource-search button; each area owns its own palette (messaging precedent).
- The Services group answers "search matches type names" client-side ("survey" surfaces the Survey service row) — pushing type-title matching into the server `where` was rejected; the client already knows `ResourceDefinitionMap`. A handful of types doesn't justify a fuzzy library; if the Pages/actions list ever grows, add `fuse.js`/`minisearch` (tiny, client-only) rather than server work.
- Recent searches are per-device by design (localStorage); server-side search history is not worth a table. Recently opened resources are not — those moved to `resource_accesses` when Recent became a list route with a visible `Last accessed` column.
- `G N` opens the [notifications](/docs/platform/notifications) bell panel — registered with the other `G`-chords.
