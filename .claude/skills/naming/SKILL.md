---
name: naming
description: Esposter naming conventions — booleans (is*/has*/show*), functions (get*/store*/on*), variables (no abbreviations, Ms suffix), Vue (modelValue, Props interface, display*, no Ref suffix), tRPC (upsert* for upserts, userId), Pinia (full store name). Apply when writing any TypeScript, Vue, or tRPC code.
---

# Naming Conventions

## Booleans

- `is*` prefix for all boolean variables and boolean-returning functions: `isManageable`, `isExpired`, `isRoomAdmin`
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasPermission`, `hasMember`. Never `can*` or `should*`
- `show*` is **banned** — rename to `is*Visible`: `showSettings` → `isSettingsVisible`, `showDialog` → `isDialogVisible`. Exception: 3rd-party API properties that can't be renamed
- `isDirty` for tracking unsaved state — never `isChanged`
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialWords`, `initialName`

## Functions

- `get*` for derivation/display functions: `getVisibilityTooltip`, `getRowTitle`
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFriend` (user action) + `storeDeleteFriend` (subscription state update). Never add `store` prefix to unpaired methods
- `on*` prefix for handler functions **only when wrapping an existing named store/service fn**: `onUpdateMessage` wraps `updateMessage`. Direct actions use the action name: `submit`, `save`, `delete` — never `onSubmit`, `onSave`, `onDelete`
- **No cardinality suffixes** — when upgrading single-item → batch, keep the same name. Never add `ByRooms`, `ByIds`, `Many`, `Batch`

## Variables

- **No abbreviations** — `directMessageRoom` not `dmRoom`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`, `timeoutMs`
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFriends`, `displayReceivedFriendRequests`. Never `sorted*` or `filtered*`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, not `WithSourceColumnId`. Schema variables follow: `sourceColumnIdSchema` not `withSourceColumnIdSchema`
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
