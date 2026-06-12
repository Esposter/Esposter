---
name: naming
description: Esposter naming conventions — booleans (is*/has*/show*), functions (get*/store*/on*), variables (no abbreviations, Ms suffix), Vue (modelValue, Props interface, display*, no Ref suffix), tRPC (upsert* for upserts, userId), Pinia (full store name). Apply when writing any TypeScript, Vue, or tRPC code.
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

## Vue

- **Props interface**: always `interface {ComponentName}Props` (e.g. `interface DialogProps`), always call `defineProps<{ComponentName}Props>()`
- **`modelValue`** for `defineModel` variable — never `model` or any other alias: `const modelValue = defineModel<string>()`
- **Template refs**: no `Ref` suffix — `const errorIcon = useTemplateRef(...)` not `const errorIconRef = ...`
- **Prop shorthand naming** — name local variables to match the target prop: `const dataSourceType = ref(...)` → `:dataSourceType`

## Pinia Stores

- Always use full descriptive store name — `const fileTableEditorStore = useFileTableEditorStore()`. Never `const store = ...`. Exception: conditional assignment where store type varies at runtime

## Regex Constants

- Named regex constants use `_REGEX` suffix — `EMPTY_TEXT_REGEX`, `DURATION_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix.

## tRPC

- `upsert*` for procedures that do `insert().onConflictDoUpdate()` — never `update*` for these (update implies the record already exists). Domain operation names (`subscribe`, `connect`) are exempt
- Subscription naming: `on` + exact mutation name (camelCase): `createMessage` → `onCreateMessage`, `updateRole` → `onUpdateRole`
- DB result variables named after the entity: `newFriend`, `updatedFriend`, `existingFriend` — never `created`, `updated`, `existing`
