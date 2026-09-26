---
name: naming
description: Apply when naming any identifier. Esposter naming conventions — booleans, function prefixes, variables, types, constants, and the boundary every rule stops at, a name a dependency owns. Framework-specific naming lives in the vue, pinia and trpc skills.
---

# Naming Conventions

Every rule here governs a name **we** author. A name a dependency reads or writes is its own — that boundary,
and the shapes it takes, is `references/names-a-dependency-owns.md`.

**A sibling takes the identifier word, never the prose one** — grep the concept's existing type, guard and constant and match them exactly (`references/concept-words.md`).

| Read when                                                                                 | Page                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Two boolean spellings both look right — a predicate vs a flag, `isPending` vs `isLoading` | `references/boolean-families.md`        |
| Two prefixes both look right — derivation vs fetch, setter vs push, on vs handle          | `references/verb-families.md`           |
| Joining more than one id into one string — a key, a `:key`, a blob name                   | `references/composite-keys.md`          |
| Writing a duration, a date, or a literal big enough to miscount                           | `references/numbers-and-time.md`        |
| A module-scope binding could be SCREAMING_SNAKE_CASE or PascalCase, or need no name       | `references/constant-casing.md`         |
| A name could be shortened, or a compound holds a word the denylist cannot see             | `references/abbreviations.md`           |
| An enum member's value comes from outside — a wire string, a library's enum, a notation   | `references/enum-members.md`            |
| Naming something that mirrors a library — its option, key, method or wire value           | `references/names-a-dependency-owns.md` |
| A concept has a prose word and an identifier word, and a sibling needs naming             | `references/concept-words.md`           |
| Naming a map, a record, or a function that looks one up                                   | `references/map-names.md`               |
| A call's result is about to be nested into the next call                                  | `references/named-intermediates.md`     |
| Naming the session user's id, or a read scoped to the caller                              | `references/session-user.md`            |
| Naming a local editable copy of a prop or store field                                     | `references/edited-copies.md`           |
| A parameter or a loop binding nothing reads                                               | `references/unused-bindings.md`         |
| Naming a file, or renaming its export                                                     | `references/file-names.md`              |
| Setting a boolean environment variable the repo owns                                      | `references/env-values.md`              |

## Settled — do not re-propose

- **A lint rule for filename-is-the-export** — a store file exports `use<Name>Store` for a `<name>.ts` and takes its parent's word where the leaf collides (`battle/player.ts` → `useBattlePlayerStore`), and `index.ts` and `constants.ts` are the two multi-export names, so the exceptions are a roster; it stays a reading rule.
- **A word list for abbreviations** — only the short forms with no site left are denylisted (`references/abbreviations.md`); a name still in use would buy disables instead of coverage.
- **A selector for a `<script setup>` constant's casing** — whether a top-level literal is fixed or captures a ref needs scope analysis no selector has.
- **A ban on a bare-identifier initialiser (`const a = b`)** — it is also how a mutable binding is snapshotted before it is cleared and how a return shorthand is earned; a trial selector reported dozens of such sites and no alias.
- **`_` in `id-denylist`** — xml2js spells an element's text as the `_` key, so parse-tmx and xml2js declare it by that name throughout, and `no-underscore-dangle` refuses a prefixed loop declarator; a loop binding nothing reads stays bare.

## Booleans

- `is*` prefix for **boolean variables and properties only**: `isMuted`, `isRoomOwner`. Never for callable functions
- `check*` prefix for **all boolean-returning functions** (top-level, exported, or callback param): `checkIsManageable`, `checkIsStale`. Makes callability unambiguous — `checkIsManageable(...)` is always a call, `isManageable` is always a stored value. An `is*`/`has*` declarator holding a function with a `: boolean` or type-predicate return is a `no-restricted-syntax` error
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasMore`, `hasThumbnail`. Never `can*` or `should*` — enforced by `no-restricted-syntax` on the declarator name, which leaves a dependency's own key alone (LiveKit's `canPublish` grant, `URL.canParse`). A permission is `hasManageRoles`, a capability `isScreenShareSupported`
- `show*` is **banned** on a value — rename to `is*Visible`: `showFoo` → `isFooVisible` (`no-restricted-syntax`, for a declarator and a `boolean` interface member)
- `isPending` for a request in flight, `isLoading` for a wait that is not one request
- `isDirty` for tracking unsaved state — never a `changed` spelling
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialDataSource`
- Boolean-valued `LocalStorageKey` registry entries follow the same `is*` rule — the `file-organization` skill (`references/local-storage-keys.md`) owns that registry

## Functions

- `get*` for derivation/display functions: `getFooTooltip`, `getFooTitle`
- `read*` for async data-fetching functions — never `fetch*` (`fetch` is reserved for the Web API): `readFoos`
- `compute*` for a value an algorithm produces from a collection or a dataset
- CRUD prefixes (`create*`, `update*`, `delete*`) for data/store operations
- `set*` for a function that writes stored state, named after the field it writes
- `to*` for a pure conversion handing the subject back in another representation: `toTitleCase`, `toColumnKey`
- `store*` prefix for subscription-driven state-update counterparts of async user actions: `deleteFoo` (user action) + `storeDeleteFoo` (subscription update). Never on unpaired methods
- `on*` for a function something else calls with an event or an input it did not initiate; direct actions use the action name (`submit`, `save`, `delete`)
- **No cardinality suffixes** — upgrading single-item → batch keeps the same name

## Variables

- **No abbreviations** — `directMessageFoo` not `dmFoo`, `existingDirectMessage` not `existing` (bare `existing` is in `id-denylist`). Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`. Where the rule stops — the short forms lint actually bans, the compound spellings it cannot see, and the exported, component and file names that spell the word out — `references/abbreviations.md`
- **A name carries its type, never a bare generic** like `parsed` (`id-denylist`) — `parsedDate`, `parsedResult`
- **A map or record is `<key><value>Map`**, never `<value>By<key>` or `<key>To<value>`; a function keeps its `By<Selector>` (`references/map-names.md`)
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `Ban` (table `bansInMessage`) is `const ban`, never `const bannedUser` nor `const banInMessage`. Where the suffix is kept it is the table's own name and never pluralised — `InMessages` is a `no-restricted-syntax` error
- **A call's result gets a name rather than being nested into the next call**, named after the function with `get`/`read` dropped (`references/named-intermediates.md`)
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId` or `self`; `my*` on a read scopes it to the caller (`references/session-user.md`)
- A comparator's pair is named for what it compares — `(firstRoom, secondRoom)`, never `(a, b)` (`no-restricted-syntax` on a `sort`/`toSorted` callback)
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `edited{PropName}` for a **local editable copy** of a prop or store field — never `{prop}Value` (`references/edited-copies.md`)
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, never bare `_`, except a loop binding (`references/unused-bindings.md`)
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFoos`. Never `sorted*` or `filtered*`
- A composite key is joined with `ID_SEPARATOR`, never a hand-written delimiter — `references/composite-keys.md`

## Environment Variables

- **Our own env var values are always the strings `"true"` / `"false"`** — never `"0"` / `"1"` (`references/env-values.md`)

## Import Aliases

- **No `_` prefix for import aliases** (`no-restricted-syntax`) — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, never `With`-prefixed. Schemas and their factories follow: `sourceColumnIdSchema` / `create<Capability>Schema`, never `createWith<Capability>Schema`
- **`A` prefix for abstract classes only** — `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓. Lint refuses it on an interface, so the question is what to call one instead: an interface holding the shape its implementors share takes `Base*`, matching the `base*Schema` it is usually declared beside (`BaseColumnForm`, `BaseExecuteAdminActionInput`); anything else is named after what it holds
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **A wrong name is corrected in place, never aliased** — no re-export shim, no version suffix, no comment explaining the history, and neither "it is deployed" nor "it is published" is an exemption (`apps/web/content/docs/architecture/no-compatibility-debt.md`; the mechanics of the rename are the `file-organization` skill's `references/renames.md`). A name that is still accurate is left alone: correctness is the criterion, not symmetry with its neighbours.
- **A file's name is its single export's name**, and renaming the export renames the file in the same change (`references/file-names.md`)
- **An enum member is PascalCase; its value keeps the outside spelling** — `Dark = "dark"`, `Eq = "eq"`; lint refuses any other member casing. Where an outside spelling seems to belong on the member, and the two that keep it behind a disable — `references/enum-members.md`
- A panel's subsections, or any list whose labels are also its ids, are one enum per group — `references/section-enums.md`

## Constants

- **A module-scope constant holding a fixed scalar is SCREAMING_SNAKE_CASE** — `MAX_INVITE_ID_RETRIES`, `SEARCH_SIMILARITY_THRESHOLD`. Where PascalCase competes with it — a lookup table, a fixed list that is not one, `apps/infra`'s one-per-file rule — and where the literal should carry no name at all: `references/constant-casing.md`
- Named regex constants use `_REGEX` suffix — `FOO_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix (`no-restricted-syntax`, for a module-scope regex or `new RegExp`)

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
