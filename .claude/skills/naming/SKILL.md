---
name: naming
description: Esposter naming conventions — booleans (is*/has*/show*), functions (get*/read*/store*/on*), variables (no abbreviations, Ms suffix, userId), numbers/time, import aliases, interfaces/classes (A prefix, no With prefix), regex (_REGEX). Apply when naming any identifier. Framework-specific naming lives in the vue/pinia/trpc skills.
---

# Naming Conventions

## Booleans

- `is*` prefix for **boolean variables and properties only**: `isMuted`, `isRoomOwner`. Never for callable functions
- `check*` prefix for **all boolean-returning functions** (top-level, exported, or callback param): `checkIsManageable`, `checkIsStale`. Makes callability unambiguous — `checkIsManageable(...)` is always a call, `isManageable` is always a stored value
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasPermission`, `hasMember`. Never `can*` or `should*`
- `show*` is **banned** — rename to `is*Visible`: `showSettings` → `isSettingsVisible`, `showDialog` → `isDialogVisible`. Exception: 3rd-party API properties that can't be renamed
- `isDirty` for tracking unsaved state — never `isChanged`
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialWords`, `initialName`
- Boolean-valued `LocalStorageKey` registry entries follow the same `is*` rule (`IsResourceListCollapsed`) — the `file-organization` skill (`references/local-storage-keys.md`) owns that registry

## Functions

- `get*` for derivation/display functions: `getFooTooltip`, `getFooTitle`
- `read*` for async data-fetching functions — never `fetch*` (`fetch` is reserved for the Web API): `readFoos`
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFoo` (user action) + `storeDeleteFoo` (subscription update). Never on unpaired methods
- `on*` prefix for handlers **only when wrapping an existing named store/service fn**: `onUpdateFoo` wraps `updateFoo`. Direct actions use the action name: `submit`, `save`, `delete` — never `onSubmit`/`onSave`/`onDelete`
- **No cardinality suffixes** — when upgrading single-item → batch, keep the same name. Never add `ByRooms`, `ByIds`, `Many`, `Batch`

## Variables

- **No abbreviations** — `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`
  - Applies to exported names too — spell the full English word: `statistics` not `stat`/`stats` (`ColumnStatistics`, `ColumnStatisticsDefinitionMap`, `useColumnStatistics`, never `ColumnStatDefinitions`/`defineColumnStat`), `summation` not `sum` as a statistics identifier (the `ColumnStatisticsKey` is `summation`). Does NOT apply to math accumulator locals (`acc`, `s`) or the display title `"Sum"`.
- **`ctx` is the name for a tRPC context value**, in source and tests alike — it mirrors tRPC's own `{ ctx }` destructure, so a local or parameter typed `Context`/`AuthedContext` stays `ctx`. Expanding it to `context` in one file only desyncs that file from every call site.
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `PushSubscription` (table `pushSubscriptionsInMessage`) is `const pushSubscription`, never `const subscription` nor `const pushSubscriptionInMessage`. Omit only the `InMessage`/`inMessage` namespacing suffix.
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `edited{PropName}` for a **local editable copy** of a prop/store field (form drafts, buffered inputs) — the value a `v-text-field`/`v-model` binds to before save: `editedName` (copy of `resource.name`), `editedRow`, `editedImage`. Never `{prop}Value` (`renameValue` ✗) nor a bare restatement of the field. Holds whether the copy is a plain `ref(source)` or a `useCloned(() => source)` — the prefix marks it as the draft, not the source of truth
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@submit="async (_event, onComplete) => {...}"`
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFoos`. Never `sorted*` or `filtered*`

## Numbers & Time

- **Time durations use `dayjs.duration(...)`** — never inline arithmetic (`7 * 24 * 60 * 60 * 1000`) or raw literals (`604800`). Use `dayjs.duration(7, "days").asMilliseconds()`/`.asSeconds()`, `dayjs().add(1, "minute").toDate()` for "now + N", and `dayjs.duration(ms).asSeconds()`/`.asMinutes()` for ms→unit (never `ms / 1000`). Import: `import { dayjs } from "#shared/services/dayjs"`. Packages without dayjs (`azure-mock`, `infra`) fall back to a digit-separated literal (file-local `const` if reused).
- **Big numeric literals get `_` digit-group separators** — any literal with 5+ digits: `604_800_000`, `86_400`, `60_000`. Applies to non-time tuning constants too (epoch offsets, decay divisors). Small/clear values (`1024`, `1024 * 1024`) stay as-is. (`unicorn/numeric-separators-style` only fixes the _style_ of existing separators; adding them is on you.)

## Environment Variables

- **Our own env var values are always the strings `"true"` / `"false"` — never `"0"` / `"1"`.** Keeps every custom flag we set consistent and self-describing: the `VIRRUN` presence signal is `"true"`, the install path sets `CI` to `"true"` (`CI_ENV_VALUE`), etc. A boolean env var is spelled like a boolean.
- **Exception: external / de-facto-standard vars keep their own API — do not force true/false onto them.** `NO_COLOR` is presence-based (any non-empty value disables), and `FORCE_COLOR` uses supports-color's own scale — `"0"`/`"false"` off, `"1"`/`"2"`/`"3"` for 16/256/truecolor levels. Read and set those per their spec, not our convention.

## Import Aliases

- **No `_` prefix for import aliases** — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, not `WithSourceColumnId`. Schemas and their factories follow: `sourceColumnIdSchema` / `create<Capability>Schema`, never `createWith<Capability>Schema`
- **`A` prefix for abstract classes only** — never on interfaces. `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓, `ASlashCommand` ✗
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **A file's name is its single export's name** — `getPostRanking.ts` → `export const getPostRanking`, `FooMap.ts` → `export const FooMap`. This holds for every export, not just constant maps: a noun filename over a `get*` function (`ranking.ts`) hides that the export breaks the verb-prefix rule, and a filename that merely resembles the export (`callParticipantMap.ts` exporting `callSessionParticipantMap`) makes the export unfindable by path. Renaming the export renames the file, in the same change. (Any camelCase-named file holding a PascalCase constant is a legacy outlier — don't copy it.)
- **Casing conventions apply to identifiers we author, never to foreign wire values.** A key that _is_ a protocol string — a provider's error code read off a redirect query, a field of a third-party payload we accept or emit verbatim — keeps that provider's spelling, `snake_case` included, because renaming it breaks the lookup or the contract. Type the map's key as `string` when the library exports no union for it (most don't, and hand-copying their literals into a union drifts silently), and give the lookup a fallback so an unmapped value degrades instead of rendering blank. Our own key beside it still gets camelCase.
- **UI section enums: one per group, values double as title + id** — when a panel has scrollable subsections (or any list whose labels also serve as stable ids/anchors), model each group as its own enum whose values are the human title (e.g. `FooSection { Bar = "Bar Baz", ... }`). The value is reused as the display title and the DOM/scroll id, so don't derive a separate slug. One enum per subsection group, never a shared catch-all.

## Regex Constants

- Named regex constants use `_REGEX` suffix — `FOO_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix.

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
