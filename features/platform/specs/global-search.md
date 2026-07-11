# Platform — Global Search

Azure-portal-faithful global search: an as-you-type dropdown panel grouped into Resources / Services / Pages, reachable from every page via `Ctrl+K` and `G /`, replacing today's plain text field that only routes to `/all` on Enter.

## Overview

The portal's top-bar search is the primary navigation surface: typing shows grouped instant results with keyboard navigation, and the empty field shows recent searches + recently viewed. Ours is one component, `ResourceSearchMenu`, mounted two ways — inline on Home (portal landing parity) and as a `Ctrl+K` dialog overlay everywhere else (this doubles as the post-consolidation command palette the old roadmap wanted back). No new backend: the Resources group rides `resource.readResources`.

## Dropdown contents

| Group     | Source                                                               | Row                                     | Target                                                        |
| --------- | -------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| Resources | debounced (300ms) `resource.readResources { searchQuery, limit: 5 }` | type icon · name · type caption         | `RoutePath.Resource(id)`                                      |
| Services  | client-side match over `ResourceDefinitionMap` title/description     | type icon · title · "Create" sub-action | `/resources/all?types=X`; Create → `/resources/create/[type]` |
| Pages     | static list                                                          | page icon · title                       | Home, All resources, Create a resource                        |
| footer    | always when a query is set                                           | "See all results →"                     | `/resources/all?search={q}`                                   |

- **Empty query**: two groups instead — recent searches (`LocalStorageKey.ResourceRecentSearches`, capped at 5, pushed on submit/pick) and recently viewed (see [favorites-and-recents.md](favorites-and-recents.md)).
- **Match highlight**: bold the matched substring in row titles (`v-list-item` title slot).
- **No results**: single "No resources found for '{q}'" row + the See-all footer.
- Services matching is plain case-insensitive substring — 7 types don't justify a fuzzy library; if the Pages/actions list ever grows, add `fuse.js`/`minisearch` (tiny, client-only) rather than server work.

## Flow

```mermaid
flowchart LR
  HOME["Home inline mount"] --> SM["ResourceSearchMenu"]
  CK["Ctrl+K / app-bar button<br/>(any page)"] --> DLG["SearchDialog"] --> SM
  GS["G / shortcut"] --> SM

  SM -->|"query (300ms debounce)"| RR["resource.readResources<br/>{ searchQuery, limit: 5 }"] --> RG["Resources group"]
  SM -->|client substring| RDM["ResourceDefinitionMap"] --> SG["Services group"]
  SM --> PG["Pages group (static)"]
  SM -->|empty query| LS["LocalStorageKey.ResourceRecentSearches<br/>+ ResourceRecentViews"]

  RG -->|Enter/click| RES["/resources/[id]"]
  SG --> ALLT["/resources/all?types=X"]
  SG -->|Create sub-action| CT["/resources/create/[type]"]
  SM -->|"See all results →"| ALL["/resources/all?search=q"]
```

## Keyboard

- `Ctrl+K` opens the dialog mount anywhere (authed platform pages); `Esc` closes; `↑`/`↓` move through a flat list across groups; `Enter` activates. `Tab` stays trapped in the panel in the `SearchDialog` mount only — the inline Home mount keeps normal document tab order. ARIA: the field is `role="combobox"` with `aria-expanded`/`aria-activedescendant`, the panel `role="listbox"`.
- Azure `G`-chord shortcuts (via `useMagicKeys` or the existing keyboard-shortcut components): `G /` focus search (the Home placeholder already advertises this — currently unimplemented), `G H` → Home, `G A` → `/resources/all`, `G N` → notifications panel ([notifications.md](notifications.md)).
- `?` opens a shortcuts overlay dialog listing all bindings (Azure has the same panel). Chords are suppressed while focus is in an input/editor.

## Relevance ladder

1. **Now (free)**: rank prefix matches first, the remaining substring matches after, newest-first within each tier — `orderBy(desc(ilike(resources.name, prefix)), desc(resources.updatedAt))` in `readResources`, where `prefix` is the search value with `%` appended, bound through the query builder (never interpolated into SQL). Keep `createResourcesWhere` as the single filter source.
2. **Postgres migration**: `pg_trgm` extension + GIN index on `resources.name`, rank by `similarity()` — typo tolerance at zero service cost.
3. **Azure AI Search** — [deferred/azure-ai-search.md](../deferred/azure-ai-search.md); nothing at current volumes needs it.

## Components

- `components/Resource/SearchMenu.vue` — the combobox field + grouped results panel; owns debounce, keyboard nav, highlight, recent-search persistence
- `components/Resource/SearchDialog.vue` — `v-dialog` wrapper for the `Ctrl+K`/app-bar mount
- `components/App/ShortcutsOverlay.vue` — `?` shortcuts help dialog
- `pages/resources/index.vue` — replaces its bare `v-text-field` with the inline `SearchMenu`

## Key Files

| File                                       | Role                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| `app/components/Resource/SearchMenu.vue`   | grouped dropdown search (single source for both mounts) |
| `app/components/Resource/SearchDialog.vue` | `Ctrl+K` overlay mount                                  |
| `app/services/shared/LocalStorageKey.ts`   | `ResourceRecentSearches` key                            |
| `server/trpc/routers/resource.ts`          | prefix-match ranking in `readResources`                 |

## Constraints / Notes

- One component, two mounts — never two search implementations (Home vs overlay).
- The Services group answers "search matches type names" client-side ("survey" surfaces the Survey service row) — rejected pushing type-title matching into the server `where`; the client already knows `ResourceDefinitionMap`.
- Recent searches/views are per-device by design (localStorage); server-side history is not worth a table.
