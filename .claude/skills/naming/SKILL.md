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

## Functions

- `get*` for derivation/display functions: `getVisibilityTooltip`, `getRowTitle`
- `read*` for async data-fetching functions — never `fetch*` (`fetch` is reserved for the Web API): `readMemberMentionItems`, `readRoles`
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFriend` (user action) + `storeDeleteFriend` (subscription update). Never on unpaired methods
- `on*` prefix for handlers **only when wrapping an existing named store/service fn**: `onUpdateMessage` wraps `updateMessage`. Direct actions use the action name: `submit`, `save`, `delete` — never `onSubmit`/`onSave`/`onDelete`
- **No cardinality suffixes** — when upgrading single-item → batch, keep the same name. Never add `ByRooms`, `ByIds`, `Many`, `Batch`

## Variables

- **No abbreviations** — `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`
  - Applies to exported names too — spell the full English word: `statistics` not `stat`/`stats` (e.g. `ColumnStatistics`, `useColumnStatistics`), `summation` not `sum` as a statistics identifier (`FooterStatisticsType.Summation`). Does NOT apply to math accumulator locals (`acc`, `s`) or the display title `"Sum"`. Prefer `FooterStatisticsType` over `FooterStatType`.
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `PushSubscription` (table `pushSubscriptionsInMessage`) is `const pushSubscription`, never `const subscription` nor `const pushSubscriptionInMessage`. Omit only the `InMessage`/`inMessage` namespacing suffix.
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@submit="async (_event, onComplete) => {...}"`
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFriends`. Never `sorted*` or `filtered*`

## Numbers & Time

- **Time durations use `dayjs.duration(...)`** — never inline arithmetic (`7 * 24 * 60 * 60 * 1000`) or raw literals (`604800`). Use `dayjs.duration(7, "days").asMilliseconds()`/`.asSeconds()`, `dayjs().add(1, "minute").toDate()` for "now + N", and `dayjs.duration(ms).asSeconds()`/`.asMinutes()` for ms→unit (never `ms / 1000`). Import: `import { dayjs } from "#shared/services/dayjs"`. Packages without dayjs (`azure-mock`, `infra`) fall back to a digit-separated literal (file-local `const` if reused).
- **Big numeric literals get `_` digit-group separators** — any literal with 5+ digits: `604_800_000`, `86_400`, `60_000`. Applies to non-time tuning constants too (epoch offsets, decay divisors). Small/clear values (`1024`, `1024 * 1024`) stay as-is. (`unicorn/numeric-separators-style` only fixes the _style_ of existing separators; adding them is on you.)

## Import Aliases

- **No `_` prefix for import aliases** — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, not `WithSourceColumnId`. Schema factories follow: `createSourceColumnIdSchema` not `createWithSourceColumnIdSchema`
- **`A` prefix for abstract classes only** — never on interfaces. `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓, `ASlashCommand` ✗
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **Constant arrays/maps use PascalCase** — `export const PermissionItems = [...]`, `export const FrierenExpressions: Expression[] = [...]`. File names match: `PermissionItems.ts`

## Regex Constants

- Named regex constants use `_REGEX` suffix — `EMPTY_TEXT_REGEX`, `DURATION_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix.

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
