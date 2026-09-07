---
name: naming
description: Esposter naming conventions — booleans (is*/has*/show*, isPending vs isLoading), function prefixes (get*/read*/create*/store*/on*), variables (no abbreviations, <key><value>Map, userId, edited*), interfaces and classes (A prefix, no With prefix), constants (SCREAMING_SNAKE_CASE vs a PascalCase table), regex (_REGEX), and the boundary every rule stops at — a name a dependency owns. Plus deep dives on the families that collide (check vs is vs getIs, isPending vs isLoading, get vs read vs compute, set vs apply, on vs handle), composite keys and ID_SEPARATOR, durations and dates, and names a dependency owns. Apply when naming any identifier. Framework-specific naming lives in the vue/pinia/trpc skills.
---

# Naming Conventions

Every rule here governs a name **we** author. A name a dependency reads or writes is its own — that boundary,
and the eight shapes it takes, is `references/names-a-dependency-owns.md`.

| Read when                                                                                 | Page                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Two boolean spellings both look right — a predicate vs a flag, `isPending` vs `isLoading` | `references/boolean-families.md`        |
| Two prefixes both look right — derivation vs fetch, setter vs push, on vs handle          | `references/verb-families.md`           |
| Joining more than one id into one string — a key, a `:key`, a blob name                   | `references/composite-keys.md`          |
| Writing a duration, a date, or a literal big enough to miscount                           | `references/numbers-and-time.md`        |
| Naming something that mirrors a library — its option, key, method or wire value           | `references/names-a-dependency-owns.md` |

## Booleans

- `is*` prefix for **boolean variables and properties only**: `isMuted`, `isRoomOwner`. Never for callable functions
- `check*` prefix for **all boolean-returning functions** (top-level, exported, or callback param): `checkIsManageable`, `checkIsStale`. Makes callability unambiguous — `checkIsManageable(...)` is always a call, `isManageable` is always a stored value
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasPermission`, `hasMember`. Never `can*` or `should*` — enforced by `no-restricted-syntax` on the declarator name, which leaves a dependency's own key alone (LiveKit's `canPublish` grant, `URL.canParse`). A permission is `hasManageRoles`, a capability `isScreenShareSupported`
- `show*` is **banned** — rename to `is*Visible`: `showSettings` → `isSettingsVisible`, `showDialog` → `isDialogVisible`
- `isPending` for a request in flight, `isLoading` for a wait that is not one request
- `isDirty` for tracking unsaved state — never `isChanged`
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialWords`, `initialName`
- Boolean-valued `LocalStorageKey` registry entries follow the same `is*` rule (`IsResourceListCollapsed`) — the `file-organization` skill (`references/local-storage-keys.md`) owns that registry

Where two of these collide — `check*` against `is*` against `getIs*`, and `isPending` against `isLoading` —
`references/boolean-families.md` separates them.

## Functions

- `get*` for derivation/display functions: `getFooTooltip`, `getFooTitle`
- `read*` for async data-fetching functions — never `fetch*` (`fetch` is reserved for the Web API): `readFoos`
- `compute*` for a value an algorithm produces from a collection or a dataset
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `set*` for a function that writes stored state, named after the field it writes
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFoo` (user action) + `storeDeleteFoo` (subscription update). Never on unpaired methods
- `on*` for a function something else calls with an event or an input it did not initiate; direct actions use the action name (`submit`, `save`, `delete`)
- **No cardinality suffixes** — upgrading single-item → batch keeps the same name

Where two of these collide — `get` against `read` against `count`, `set` against `apply`, `get` against
`compute`, `on` against `handle`, and the `By<Selector>` that is not a cardinality suffix —
`references/verb-families.md` separates them.

## Variables

- **No abbreviations** — `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`. The three with no site left — `acc`, `curr`, `idx` — are oxlint's `id-denylist`; a name still in use is not added to it, since the ban would buy disables instead of coverage
  - **A stored count is `<singular noun>Count`** — `commentCount`, `likeCount`, `webhookCount`, DB columns included. Singular, because the suffix already carries the plurality. It names a **field**; `read*Count` names the fetch that answers with a count and `count*` the in-memory tally, which are calls
  - Applies to exported names too — spell the full English word: `statistics` not `stat`/`stats` (`ColumnStatistics`, `ColumnStatisticsDefinitionMap`, `useColumnStatistics`, never `ColumnStatDefinitions`/`defineColumnStat`), `summation` not `sum` as a statistics identifier (the `ColumnStatisticsKey` is `summation`). Does NOT apply to math accumulator locals (`acc`, `s`) or the display title `"Sum"`
  - Applies to component and file names, which are identifiers the whole app types: `Navigation` never `Nav` (`StyledNavigationList`, `ResourceBladeNavigation`, `app/models/shared/NavigationItem.ts`)
- **A map or record is `<key><value>Map`, never `<value>By<key>` or `<key>To<value>`** — the key's word first, then the value's: `rowIdIndexMap`, `slugEmojiMap`, `keyValueParticipantMap`. The **value's word alone** where the key is a field that value already carries (`userMap`, `columnMap`, `customEmojiMap`), and a qualifier stays in front of the whole thing (`newRowIdIndexMap`). The order is not a preference — the repo's PascalCase lookup tables already fix it (`EmojiGroupIconMap` is group → icon, `RoomPermissionDefinitionMap` is permission → definition), so a local spelled `iconsByEmojiGroup` beside one of them is the same structure said twice. Covers a `Record`, an `Object.groupBy` result and a field holding either, and a `by*` field on an index object is the same violation with the value left out. A **function** keeps its `By<Selector>`: `getDataSourceTypeByFileName` names what it takes, not what it holds. `no-restricted-syntax` decides all of that from what the name is attached to, so the only shape left to the sweep is an untyped `To` literal — `usersToRooms` is a join table's own name, and the enforcer's object-literal branch takes the `By` infix only
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `Ban` (table `bansInMessage`) is `const ban`, never `const bannedUser` nor `const banInMessage`
- **A call's result gets a name rather than being nested into the next call**, and the name is the function's own with the `get`/`read` prefix dropped — `const activeInputResolvers = getActiveInputResolvers();` then `const update = useResolveInput(activeInputResolvers);`, never `useResolveInput(getActiveInputResolvers())`. Nesting hides a step inside a parenthesis and leaves what it produced unnamed; the extra line is what makes both readable, and it costs nothing. Holds inside a `return` too — bind the value, then build the string or the object from it. A single short argument a reader takes in at a glance (`String(value)`, `takeOne(items, index)`) stays where it is
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`. **`my*` on a read is not that ban** — it scopes the read to the caller rather than naming their id (`readMyPermissions`, `readMyInvite`, `readMySentMessages`), which is what separates it from the member-scoped read taking a `userId` beside it
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `edited{PropName}` for a **local editable copy** of a prop/store field (form drafts, buffered inputs) — the value a `v-text-field`/`v-model` binds to before save: `editedName` (copy of `resource.name`), `editedRow`, `editedImage`. Never `{prop}Value` (`renameValue` ✗) nor a bare restatement of the field. Holds whether the copy is a plain `ref(source)` or a `useCloned(() => source)` — the prefix marks it as the draft, not the source of truth
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@submit="async (_event, onComplete) => {...}"`
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFoos`. Never `sorted*` or `filtered*`
- A composite key is joined with `ID_SEPARATOR`, never a hand-written delimiter — `references/composite-keys.md`

## Environment Variables

- **Our own env var values are always the strings `"true"` / `"false"` — never `"0"` / `"1"`.** Keeps every custom flag we set consistent and self-describing: the `VIRRUN` presence signal is `"true"`, the install path sets `CI` to `"true"` (`CI_ENV_VALUE`). A boolean env var is spelled like a boolean. External vars with their own API are the dependency's (`references/names-a-dependency-owns.md`)

## Import Aliases

- **No `_` prefix for import aliases** — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, not `WithSourceColumnId`. Schemas and their factories follow: `sourceColumnIdSchema` / `create<Capability>Schema`, never `createWith<Capability>Schema`
- **`A` prefix for abstract classes only** — `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓. Lint refuses it on an interface, so the question is what to call one instead: an interface holding the shape its implementors share takes `Base*`, matching the `base*Schema` it is usually declared beside (`BaseColumnForm`, `BaseExecuteAdminActionInput`); anything else is named after what it holds
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **A wrong name is corrected in place, never aliased** — no re-export shim, no version suffix, no comment explaining the history, and neither "it is deployed" nor "it is published" is an exemption — a renamed export of a published package ships as a `refactor` rather than a major ([no compatibility debt](/docs/architecture/no-compatibility-debt)). A name that is still accurate is left alone: correctness is the criterion, not symmetry with its neighbours
- **A file's name is its single export's name** — `getPostRanking.ts` → `export const getPostRanking`, `FooMap.ts` → `export const FooMap`. This holds for every export, not just constant maps: a noun filename over a `get*` function (`ranking.ts`) hides that the export breaks the verb-prefix rule, and a filename that merely resembles the export — one dropping a word the export carries, `callParticipantMap.ts` over a `callSessionParticipantMap` — makes the export unfindable by path. Renaming the export renames the file, in the same change. (Any camelCase-named file holding a PascalCase constant is a legacy outlier — don't copy it.)
- **UI section enums: one per group, values double as title + id** — when a panel has scrollable subsections (or any list whose labels also serve as stable ids/anchors), model each group as its own enum whose values are the human title (e.g. `FooSection { Bar = "Bar Baz", ... }`). The value is reused as the display title and the DOM/scroll id, so don't derive a separate slug. One enum per subsection group, never a shared catch-all

## Constants

- **A module-scope constant holding a fixed scalar is `SCREAMING_SNAKE_CASE`** — `MAX_INVITE_ID_RETRIES`, `SEARCH_SIMILARITY_THRESHOLD`, `DUPLICATE_NAME_SUFFIX`, `CLOSED_SURVEY_ERROR_REASON`. The casing is what separates the value that is fixed for the life of the process from the local that happens to be `const`, and a camelCase one reads as the latter at every use site. A constant holding a **lookup structure** — a map, record or set the code indexes into — is PascalCase named after its file instead (`file-organization`, `references/constant-maps.md`), because there the name stands for the table rather than for one value. `packages/infra` is the one package this does not reach: a constant there is one per file named after that file, scalars included, so its casing is the file name's (`pulumi-infra`)
  - **A scalar with one reader is inlined, not named** — `:height="64"` rather than a `PANEL_HEIGHT` above it, the same answer the vue skill gives a single-use function. A name earns its line by being read twice, by compressing a derivation the use site would otherwise spell out, or by being a list or object in a render position, where a module-scope binding is what stops a fresh allocation every render. A lone literal bound once is none of those: the name adds a jump and the casing announces a constant nothing else consults
  - **A fixed list or object that is not a table the code indexes into takes the scalar's casing, not the table's** — `DELETE_BUTTON_PROPS`, `CARD_PROPS`, `MENU_COMMANDS`, `KEYBOARD_SHORTCUTS`. PascalCase is earned by being a lookup with a file of its own to be named after; a bound configuration or an iterated list inside a `<script setup>` has neither, and left camelCase it reads as one more local among the refs around it
- Named regex constants use `_REGEX` suffix — `FOO_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
