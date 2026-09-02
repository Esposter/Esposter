---
name: naming
description: Esposter naming conventions — booleans (is*/has*/show*), functions (get*/read*/store*/on*), variables (no abbreviations, Ms suffix, userId), numbers/time, import aliases, interfaces/classes (A prefix, no With prefix), regex (_REGEX). Apply when naming any identifier. Framework-specific naming lives in the vue/pinia/trpc skills.
---

# Naming Conventions

## Booleans

- `is*` prefix for **boolean variables and properties only**: `isMuted`, `isRoomOwner`. Never for callable functions
- `check*` prefix for **all boolean-returning functions** (top-level, exported, or callback param): `checkIsManageable`, `checkIsStale`. Makes callability unambiguous — `checkIsManageable(...)` is always a call, `isManageable` is always a stored value. **`getIs*` is not an alternative spelling of this** — a boolean is a derivation, so `get*` reads as if it also applied, and the family grew to twenty-odd names before anyone noticed. It does not: `check*` wins for anything whose call returns a boolean, whatever produces it. `get*` survives only where the call returns a **function** — a comparator or a middleware factory — and there the `Is` in the name is the part that is wrong, not the prefix
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasPermission`, `hasMember`. Never `can*` or `should*`
- `show*` is **banned** — rename to `is*Visible`: `showSettings` → `isSettingsVisible`, `showDialog` → `isDialogVisible`. Exception: 3rd-party API properties that can't be renamed
- **`isPending` is a request's in-flight state and keeps that name all the way to the prop that renders it.** The primitives return it (`useMutation`, `useCachedRead`, the pagination composables) and so does the library beneath them (`authClient.useSession()`), so a consumer binds `:is-pending` with nothing renamed in between. **`isLoading` is for a wait that is not one request** — a local `ref` covering a parse, a mount, or several calls a surface treats as one (`StyledWaypoint`, a sheet's first render). An alias between them (`isPending: isLoading`) means one of the two names is wrong: pick the one that describes what is actually being waited on. Per-operation flags follow `pinia`'s `is{Operation}Pending`.
- `isDirty` for tracking unsaved state — never `isChanged`
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialWords`, `initialName`
- Boolean-valued `LocalStorageKey` registry entries follow the same `is*` rule (`IsResourceListCollapsed`) — the `file-organization` skill (`references/local-storage-keys.md`) owns that registry

## Functions

- `get*` for derivation/display functions: `getFooTooltip`, `getFooTitle`
- `read*` for async data-fetching functions — never `fetch*` (`fetch` is reserved for the Web API): `readFoos`
  - **A fetch that returns a count is one of them**: `readFoosCount`, never `countFoos` — the trip is what the name has to say, and the endpoint sits beside `readFoos` in the same router. `count*` is reserved for a pure in-memory tally (`countOccurrences`), which is where the verb is the whole operation
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFoo` (user action) + `storeDeleteFoo` (subscription update). Never on unpaired methods
- `on*` prefix for handlers **only when wrapping an existing named store/service fn**: `onUpdateFoo` wraps `updateFoo`. Direct actions use the action name: `submit`, `save`, `delete` — never `onSubmit`/`onSave`/`onDelete`
- **No cardinality suffixes** — when upgrading single-item → batch, keep the same name. Never add `ByRooms`, `ByIds`, `Many`, `Batch`

## Variables

- **No abbreviations** — `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`
  - Applies to exported names too — spell the full English word: `statistics` not `stat`/`stats` (`ColumnStatistics`, `ColumnStatisticsDefinitionMap`, `useColumnStatistics`, never `ColumnStatDefinitions`/`defineColumnStat`), `summation` not `sum` as a statistics identifier (the `ColumnStatisticsKey` is `summation`). Does NOT apply to math accumulator locals (`acc`, `s`) or the display title `"Sum"`.
  - Applies to component and file names, which are identifiers the whole app types: `Navigation` never `Nav` (`StyledNavigationList`, `ResourceBladeNavigation`, `app/models/shared/NavigationItem.ts`). The one exception is a name Vuetify or another dependency owns — `v-navigation-drawer`'s own `VNavigationDrawer` is already spelled out, and a truncation like `VBtn` is theirs, not ours to expand.
- **`ctx` is the name for a tRPC context value**, in source and tests alike — it mirrors tRPC's own `{ ctx }` destructure, so a local or parameter typed `Context`/`AuthedContext` stays `ctx`. Expanding it to `context` in one file only desyncs that file from every call site.
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `Ban` (table `bansInMessage`) is `const ban`, never `const bannedUser` nor `const banInMessage`. Omit only the `InMessage`/`inMessage` namespacing suffix.
- **A call's result gets a name rather than being nested into the next call**, and the name is the function's own with the `get`/`read` prefix dropped — `const activeInputResolvers = getActiveInputResolvers();` then `const update = useResolveInput(activeInputResolvers);`, never `useResolveInput(getActiveInputResolvers())`. Nesting hides a step inside a parenthesis and leaves what it produced unnamed; the extra line is what makes both readable, and it costs nothing. Holds inside a `return` too — bind the value, then build the string or the object from it. A single short argument a reader takes in at a glance (`String(value)`, `takeOne(items, index)`) stays where it is.
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`. **`my*` on a read is not that ban** — it scopes the read to the caller rather than naming their id (`readMyPermissions`, `readMyInvite`, `readMySentMessages`), which is what separates it from the member-scoped read taking a `userId` beside it
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `edited{PropName}` for a **local editable copy** of a prop/store field (form drafts, buffered inputs) — the value a `v-text-field`/`v-model` binds to before save: `editedName` (copy of `resource.name`), `editedRow`, `editedImage`. Never `{prop}Value` (`renameValue` ✗) nor a bare restatement of the field. Holds whether the copy is a plain `ref(source)` or a `useCloned(() => source)` — the prefix marks it as the draft, not the source of truth
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@submit="async (_event, onComplete) => {...}"`
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFoos`. Never `sorted*` or `filtered*`
- **A composite key is joined with `ID_SEPARATOR`** (`@esposter/shared`), never a hand-written `-` or `:` — `` `${roomId}${ID_SEPARATOR}${userId}` ``. One constant for every composite string in the repo, keys and blob names alike: a `useMutation` key over a pair, a `useDataMap` slice key, a rendered `:key`, a list item id, a browser-storage key, a blob name. The separator is `|` because uuids contain hyphens, so a hyphenated key cannot be split back into its parts — which is exactly what the drafts page does with a composer key — and because a colon is rejected in a windows path, which the blob names reach. Keys parsed back apart split on the **first** separator only, so an id that may itself contain one goes last.
  - **A url or persisted format keeps its own named separator** (`RESOURCE_SORT_BY_SEPARATOR` for the sort-by query parameter, `LOCAL_STORAGE_KEY_SEPARATOR` for the `LocalStorageKey` values already written into browsers). Those strings live in saved links and in storage, so they carry a compatibility contract an in-memory key does not, and the two have to stay free to diverge. Named either way — the rule being enforced is that no separator is a bare literal at its use site.
  - **A key's segments are existing enum values, never a hand-spelled name.** `AsyncDataKey.ReadPosts` composes `Operation.Read` + `DatabaseEntityType.Post` + what scopes it; a `` `read-posts:${…}` `` invents a second spelling of two things the repo already names, and nothing renames with them. Reach for `Operation`, `DatabaseEntityType`/`DerivedDatabaseEntityType`, `ResourceType` and the feature's own enum before typing any segment as text.

## Numbers & Time

- **Time durations use `Temporal.Duration`** — never inline arithmetic (`7 * 24 * 60 * 60 * 1000`) or a raw literal (`604800`). `Temporal.Duration.from({ days: 7 }).total("milliseconds")`, `.total("seconds")` for a unit conversion, and `Temporal.Duration.from({ milliseconds: ms }).total("minutes")` for ms→unit (never `ms / 1000`). It is a language global — nothing to import, no plugin to register, no dependency.
  - **Every field must be a finite integer**, so a sub-second duration is written in the unit that makes it one: `0.5` seconds is `{ milliseconds: 500 }`. A milliseconds-only duration totalled in milliseconds is the number it was built from, so at that point the literal is written plainly — the wrapper would state nothing the value does not.
  - **Years, weeks and months never reach `.total()`** — they are calendar units and throw without a `relativeTo`. A year budget is `{ days: 365 }`.
  - **A duration decomposed for display is `.round({ largestUnit: "day" })` first**, then read off the `days`/`hours`/`minutes`/`seconds` **properties**. Built from one unit it carries everything in that field, so an unrounded duration reads zero for every part above it.
  - Inside a `.vue` **template attribute** the unit literals are single-quoted — a `"`-delimited attribute cannot carry a `"`.
- **There is no date library** — dates are `Temporal` too, and the repo owns the two things Temporal has no answer for. A format string goes through `formatDate`/`parseDate` (`packages/app/shared/util/date/`), the dayjs-token subset the repo actually writes; a calendar-day question goes through `@esposter/shared` (`getStartOfDay`, `getEndOfDay`, `checkIsSameDay`, `checkIsToday`, `checkIsYesterday`), never a hand-rolled instant comparison. "Now + N" is `new Date(Date.now() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"))`.
- **Big numeric literals get `_` digit-group separators** — any literal with 5+ digits: `604_800_000`, `86_400`, `60_000`. Applies to non-time tuning constants too (epoch offsets, decay divisors). Small/clear values (`1024`, `1024 * 1024`) stay as-is. (`unicorn/numeric-separators-style` only fixes the _style_ of existing separators; adding them is on you.)

## Environment Variables

- **Our own env var values are always the strings `"true"` / `"false"` — never `"0"` / `"1"`.** Keeps every custom flag we set consistent and self-describing: the `VIRRUN` presence signal is `"true"`, the install path sets `CI` to `"true"` (`CI_ENV_VALUE`), etc. A boolean env var is spelled like a boolean.
- **Exception: external / de-facto-standard vars keep their own API — do not force true/false onto them.** `NO_COLOR` is presence-based (any non-empty value disables), and `FORCE_COLOR` uses supports-color's own scale — `"0"`/`"false"` off, `"1"`/`"2"`/`"3"` for 16/256/truecolor levels. Read and set those per their spec, not our convention.

## Import Aliases

- **No `_` prefix for import aliases** — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, not `WithSourceColumnId`. Schemas and their factories follow: `sourceColumnIdSchema` / `create<Capability>Schema`, never `createWith<Capability>Schema`
- **`A` prefix for abstract classes only** — never on interfaces. `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓, `ASlashCommand` ✗. An interface holding the shape its implementors share takes `Base*`, matching the `base*Schema` it is usually declared beside: `BaseExecuteAdminActionInput`
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **A wrong name is corrected in place, never aliased** — no re-export shim, no version suffix, no comment explaining the history, and "it is deployed" is not an exemption ([no compatibility debt](/docs/architecture/no-compatibility-debt)). A name that is still accurate is left alone: correctness is the criterion, not symmetry with its neighbours.
- **A file's name is its single export's name** — `getPostRanking.ts` → `export const getPostRanking`, `FooMap.ts` → `export const FooMap`. This holds for every export, not just constant maps: a noun filename over a `get*` function (`ranking.ts`) hides that the export breaks the verb-prefix rule, and a filename that merely resembles the export (`callParticipantMap.ts` exporting `callSessionParticipantMap`) makes the export unfindable by path. Renaming the export renames the file, in the same change. (Any camelCase-named file holding a PascalCase constant is a legacy outlier — don't copy it.)
- **Casing conventions apply to identifiers we author, never to foreign wire values.** A key that _is_ a protocol string — a provider's error code read off a redirect query, a field of a third-party payload we accept or emit verbatim — keeps that provider's spelling, `snake_case` included, because renaming it breaks the lookup or the contract. Type the map's key as `string` when the library exports no union for it (most don't, and hand-copying their literals into a union drifts silently), and give the lookup a fallback so an unmapped value degrades instead of rendering blank. Our own key beside it still gets camelCase.
- **UI section enums: one per group, values double as title + id** — when a panel has scrollable subsections (or any list whose labels also serve as stable ids/anchors), model each group as its own enum whose values are the human title (e.g. `FooSection { Bar = "Bar Baz", ... }`). The value is reused as the display title and the DOM/scroll id, so don't derive a separate slug. One enum per subsection group, never a shared catch-all.

## Regex Constants

- Named regex constants use `_REGEX` suffix — `FOO_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix.

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
