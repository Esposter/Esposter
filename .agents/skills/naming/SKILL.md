---
name: naming
description: Apply when naming any identifier. Esposter naming conventions — booleans (is*/has*, check* for a predicate, isPending vs isLoading), function prefixes (get*/read*/compute*/set*/store*/on*), variables (no abbreviations, <key><value>Map, userId, edited*), interfaces and classes (A prefix for abstract classes, no With prefix), constants (SCREAMING_SNAKE_CASE for a scalar, _REGEX), and the boundary every rule stops at — a name a dependency owns. Framework-specific naming lives in the vue/pinia/trpc skills.
---

# Naming Conventions

Every rule here governs a name **we** author. A name a dependency reads or writes is its own — that boundary,
and the eight shapes it takes, is `references/names-a-dependency-owns.md`.

A subsystem often keeps two settled words for one concept on purpose: a short one for prose and a longer one for
identifiers — the persona plugin's spoken language is a **dub** in every comment and doc and a `VoiceLanguage` in
every type, guard and path. **A sibling takes the identifier word, never the prose one.** Naming the second reader
"readDub" beside `checkIsVoiceLanguage` invents a third spelling, and nothing catches it: a grep for the concept
stops finding half its call sites while the typecheck stays green. Grep the existing type, guard and constant for
the concept and match them exactly; the prose keeps its short word in comments, docs and user-facing strings.

| Read when                                                                                 | Page                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Two boolean spellings both look right — a predicate vs a flag, `isPending` vs `isLoading` | `references/boolean-families.md`        |
| Two prefixes both look right — derivation vs fetch, setter vs push, on vs handle          | `references/verb-families.md`           |
| Joining more than one id into one string — a key, a `:key`, a blob name                   | `references/composite-keys.md`          |
| Writing a duration, a date, or a literal big enough to miscount                           | `references/numbers-and-time.md`        |
| A module-scope binding could be SCREAMING_SNAKE_CASE or PascalCase, or need no name       | `references/constant-casing.md`         |
| A name could be shortened, or a compound holds a word the denylist cannot see             | `references/abbreviations.md`           |
| Naming something that mirrors a library — its option, key, method or wire value           | `references/names-a-dependency-owns.md` |

## Settled — do not re-propose

- **A lint rule for filename-is-the-export** — a store file exports `use<Name>Store` for a `<name>.ts` and takes its parent's word where the leaf collides (`battle/player.ts` → `useBattlePlayerStore`), and `index.ts` and `constants.ts` are the two multi-export names, so the exceptions are a roster; it stays a reading rule.
- **A word list for abbreviations** — only the four short forms with no site left are denylisted (`references/abbreviations.md`); a name still in use would buy disables instead of coverage.
- **A selector for a `<script setup>` constant's casing** — whether a top-level literal is fixed or captures a ref needs scope analysis no selector has.
- **A ban on a bare-identifier initialiser (`const a = b`)** — it is also how a mutable binding is snapshotted before it is cleared and how a return shorthand is earned; a trial selector reported fifty such sites and no alias.
- **`_` in `id-denylist`** — xml2js spells an element's text as the `_` key, so parse-tmx and xml2js declare it by that name throughout, and `no-underscore-dangle` refuses a prefixed loop declarator; a loop binding nothing reads stays bare.

## Booleans

- `is*` prefix for **boolean variables and properties only**: `isMuted`, `isRoomOwner`. Never for callable functions
- `check*` prefix for **all boolean-returning functions** (top-level, exported, or callback param): `checkIsManageable`, `checkIsStale`. Makes callability unambiguous — `checkIsManageable(...)` is always a call, `isManageable` is always a stored value. An `is*`/`has*` declarator holding a function with a `: boolean` or type-predicate return is a `no-restricted-syntax` error
- `has*` only when `is*` reads unnaturally — possession/membership checks: `hasMore`, `hasThumbnail`. Never `can*` or `should*` — enforced by `no-restricted-syntax` on the declarator name, which leaves a dependency's own key alone (LiveKit's `canPublish` grant, `URL.canParse`). A permission is `hasManageRoles`, a capability `isScreenShareSupported`
- `show*` is **banned** — rename to `is*Visible`: `showFoo` → `isFooVisible`
- `isPending` for a request in flight, `isLoading` for a wait that is not one request
- `isDirty` for tracking unsaved state — never a `changed` spelling
- `initial*` for the last-saved snapshot used in dirty comparisons: `initialDataSource`
- Boolean-valued `LocalStorageKey` registry entries follow the same `is*` rule — the `file-organization` skill (`references/local-storage-keys.md`) owns that registry

Where two of these collide — `check*` against `is*` against `getIs*`, and `isPending` against `isLoading` —
`references/boolean-families.md` separates them.

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

Where two of these collide — `get` against `read` against `count`, `set` against `apply`, `get` against
`compute`, `get` against `to`, `on` against `handle`, and the `By<Selector>` that is not a cardinality suffix —
`references/verb-families.md` separates them.

## Variables

- **No abbreviations** — `directMessageFoo` not `dmFoo`, `existingDirectMessage` not `existing`. Exception: `Ms` suffix for time values: `slowmodeMs`, `durationMs`. Where the rule stops — the four short forms lint actually bans, the compound spellings it cannot see, and the exported, component and file names that spell the word out — `references/abbreviations.md`
- **A map or record is `<key><value>Map`, never `<value>By<key>` or `<key>To<value>`** — the key's word first, then the value's (`rowIdIndexMap`, `slugEmojiMap`); the value's word alone where the key is a field the value already carries (`userMap`); a qualifier in front of the whole (`newFooBarMap`). The order is the repo's PascalCase lookup tables' (`EmojiGroupIconMap` is group → icon). A **function** keeps its `By<Selector>` — it names what it takes. `no-restricted-syntax` decides all of that from what the name is attached to; the one shape left to a reader is an untyped `To` literal, where `usersToRooms` is a join table's own name.
- **Name variables after their full domain type, dropping only the schema `InMessage` suffix** — a value typed as `Ban` (table `bansInMessage`) is `const ban`, never `const bannedUser` nor `const banInMessage`. Where the suffix is kept it is the table's own name and never pluralised — `InMessages` is a `no-restricted-syntax` error
- **A call's result gets a name rather than being nested into the next call**, and the name is the function's own with the `get`/`read` prefix dropped — `const activeInputResolvers = getActiveInputResolvers();` then `const update = useResolveInput(activeInputResolvers);`, never `useResolveInput(getActiveInputResolvers())`. Nesting hides a step inside a parenthesis and leaves what it produced unnamed; the extra line is what makes both readable, and it costs nothing. Holds inside a `return` too — bind the value, then build the string or the object from it. A single short argument a reader takes in at a glance (`String(value)`, `takeOne(items, index)`) stays where it is. A binding that keeps the verb (`const readPost = await readPost(…)`) is `naming/no-call-named-binding`
- **No `current*` prefix** for reactive refs/computeds — they are always the current value. Exception: global store identifiers distinguishing the active item from a collection: `currentRoomId`
- `userId` for the session user's ID — never `me`, `myId`, `self`. **`my*` on a read is not that ban** — it scopes the read to the caller rather than naming their id (`readMyPermissions`, `readMyInvite`, `readMySentMessages`), which is what separates it from the member-scoped read taking a `userId` beside it
- `new{PropName}` for `onUpdate:*` handler parameters: `(newItemsPerPage) =>`, `(newModelValue) =>`
- `edited{PropName}` for a **local editable copy** of a prop/store field (form drafts, buffered inputs) — the value a `v-text-field`/`v-model` binds to before save: `editedName` (copy of `resource.name`), `editedRow`, `editedImage`. Never `{prop}Value` (`renameValue` ✗) nor a bare restatement of the field. Holds whether the copy is a plain `ref(source)` or a `useCloned(() => source)` — the prefix marks it as the draft, not the source of truth
- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@submit="async (_event, onComplete) => {...}"`. A **loop** binding nothing reads is the one place bare `_` stands (`for await (const _ of glob(…)) return true`): `no-underscore-dangle` allows the prefix on a parameter only, so a `_match` declarator is a lint error there
- `display*` for presentation-layer computed that sorts/filters raw store data: `displayFoos`. Never `sorted*` or `filtered*`
- A composite key is joined with `ID_SEPARATOR`, never a hand-written delimiter — `references/composite-keys.md`

## Environment Variables

- **Our own env var values are always the strings `"true"` / `"false"` — never `"0"` / `"1"`.** Keeps every custom flag we set consistent and self-describing: the `VIRRUN` presence signal is `"true"`, the install path sets `CI` to `"true"` (`CI_ENV_VALUE`). A boolean env var is spelled like a boolean. External vars with their own API are the dependency's (`references/names-a-dependency-owns.md`)

## Import Aliases

- **No `_` prefix for import aliases** — use `base*` prefix when renaming an import to avoid a name clash: `import { getMentions as baseMentions }`. Never `import { getMentions as _getMentions }`

## TypeScript & Interfaces

- **No `With` prefix on mixin interfaces** — name after the capability: `SourceColumnId`, never `With`-prefixed. Schemas and their factories follow: `sourceColumnIdSchema` / `create<Capability>Schema`, never `createWith<Capability>Schema`
- **`A` prefix for abstract classes only** — `AColumn` (abstract class) ✓, `SlashCommand` (interface) ✓. Lint refuses it on an interface, so the question is what to call one instead: an interface holding the shape its implementors share takes `Base*`, matching the `base*Schema` it is usually declared beside (`BaseColumnForm`, `BaseExecuteAdminActionInput`); anything else is named after what it holds
- **Interface fields use full type name** — `aggregationType: AggregationTransformationType` not `transform`, `mode`, or `type`. Never abbreviate enum field names
- **A wrong name is corrected in place, never aliased** — no re-export shim, no version suffix, no comment explaining the history, and neither "it is deployed" nor "it is published" is an exemption (`apps/web/content/docs/architecture/no-compatibility-debt.md`; the mechanics of the rename are the `file-organization` skill's `references/renames.md`). A name that is still accurate is left alone: correctness is the criterion, not symmetry with its neighbours.
- **A file's name is its single export's name** — `getPostRanking.ts` → `export const getPostRanking`, `FooMap.ts` → `export const FooMap`. This holds for every export, not just constant maps: a noun filename over a `get*` function (`ranking.ts`) hides that the export breaks the verb-prefix rule, and a filename that merely resembles the export — one dropping a word the export carries, `callParticipantMap.ts` over a `callSessionParticipantMap` — makes the export unfindable by path. Renaming the export renames the file, in the same change. (Any camelCase-named file holding a PascalCase constant is a legacy outlier — don't copy it.)
- **An enum member is PascalCase; its value keeps the outside spelling** — `Dark = "dark"`, `Eq = "eq"`. A member is only our code's name for the value, so it follows our casing even where its values come from another library. Members copying an outside casing — the OData operators' `eq`, the Tiled types' `objectgroup` — were the earlier direction and are rejected: only the value is the outside vocabulary's. Lint refuses a lowercase, underscored or all-capitals member; two exceptions sit behind a disable: a standard notation whose casing is its meaning, `DateToken`'s format tokens (`MM` a month, `mm` a minute), and a mirror TypeScript must accept as a library's own enum — the dungeons' `Direction` copies grid-engine's member names, since two enums are compatible only when their names match too
- **UI section enums: one per group, values double as title + id** — when a panel has scrollable subsections (or any list whose labels also serve as stable ids/anchors), model each group as its own enum whose values are the human title (e.g. `FooSection { Bar = "Bar Baz", ... }`). The value is reused as the display title and the DOM/scroll id, so don't derive a separate slug. One enum per subsection group, never a shared catch-all

## Constants

- **A module-scope constant holding a fixed scalar is SCREAMING_SNAKE_CASE** — `MAX_INVITE_ID_RETRIES`, `SEARCH_SIMILARITY_THRESHOLD`. Where PascalCase competes with it — a lookup table, a fixed list that is not one, `apps/infra`'s one-per-file rule — and where the literal should carry no name at all: `references/constant-casing.md`
- Named regex constants use `_REGEX` suffix — `FOO_REGEX`. **Never** `_RE`, `_PATTERN`, or any other suffix

## Framework-Specific Naming

Framework naming lives with its framework: Vue (props interface, `modelValue`, template refs, prop shorthand) → `vue`; store variables → `pinia`; procedures, subscriptions, DB result vars → `trpc`.
