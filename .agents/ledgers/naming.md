# Naming

| Unit                                                                                                                                        | Swept      | Notes                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                                                                                                   | 2026-08-30 |                                                                                                   |
| `app/shared/services`, `app/shared/util`                                                                                                    | 2026-08-27 |                                                                                                   |
| `app/shared/models/db/message`                                                                                                              | 2026-09-02 | the input schemas every message router imports                                                    |
| `app/shared/models/db` — `room`, `role`, `moderation`, `webhook`, …                                                                         | 2026-09-02 | a field mirroring its own column is `packages/db-schema`'s row, not this one                      |
| `app/shared/models/db` — the rest                                                                                                           | 2026-09-02 |                                                                                                   |
| `app/shared/models/resource/sheet`                                                                                                          | 2026-09-02 |                                                                                                   |
| `app/shared/models/resource` — the rest                                                                                                     | 2026-09-02 | a type naming what a procedure answers with ends in `Result`                                      |
| `app/shared/models/dungeons`                                                                                                                | 2026-09-02 | the grid-engine `Direction` casing is theirs                                                      |
| `app/shared/models` — the editor and game trees                                                                                             | 2026-09-02 | these mirror `@vue-flow/core` and ApexCharts field for field, so their spellings are not ours     |
| `app/shared/models` — the rest                                                                                                              | 2026-09-03 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth`   |
| `server/trpc/routers` — `message`, `room`, `userToRoom`, `role`, `call`, `webhook`, `searchHistory`                                         | 2026-09-03 | procedure and result naming; the `trpc` skill owns the pattern                                    |
| `server/trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-09-03 | an error constructor is `get*Error`, matching the guards                                          |
| `server/trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | 2026-09-03 |                                                                                                   |
| `server/trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | 2026-09-03 | a caller-scoped read is `readMy*`, never `readOwn*`                                               |
| `server/trpc/{guards,procedure,plugins,middleware}`, `context.ts`                                                                           | 2026-09-03 | a guard that throws is `assert*`; `is*` is a stored boolean and nothing else                      |
| `server/composables`, `server/api`, `server/routes`                                                                                         | 2026-09-03 | `get*` vs `read*` on the server side                                                              |
| `server/services/message`                                                                                                                   | 2026-09-03 | a product's own casing carries into a local — `liveKit`, never `livekit`                          |
| `server/services/resource`                                                                                                                  | 2026-09-03 |                                                                                                   |
| `server/services` — `room`, `role`, `user`, `friend`, `post`                                                                                | 2026-09-03 |                                                                                                   |
| `server/services` — `blueprint`, `program`, `survey`, `dataset`, `dashboard`, `emailEditor`                                                 | 2026-09-03 | a constant map or set stays PascalCase; a scalar is `SCREAMING_SNAKE`                             |
| `server/services` — `azure`, `storage`, `livekit`, `notification`, `events`, `request`                                                      | 2026-09-03 |                                                                                                   |
| `server/services` — `auth`, `rateLimiter`, `achievement`, `pagination`, `db`, `blobState`                                                   | 2026-09-03 |                                                                                                   |
| `app/store/message` — the root files                                                                                                        | 2026-09-03 | CRUD verbs, `store*` subscription handlers                                                        |
| `app/store/message/room`                                                                                                                    | 2026-09-03 | a setter is named for the boolean it writes; `apply*` pushes stored state onto something live     |
| `app/store/message/input`                                                                                                                   | 2026-09-03 | `store*` is for a paired subscription handler; a `getIs*` returning a boolean is `check*`         |
| `app/store/message/user`                                                                                                                    | 2026-09-03 | a store file's name carries every word its export does, the parent path aside                     |
| `app/store/message` — `file`, `search`, `ui`, `moderation`, `draftsAndSent`                                                                 | 2026-09-03 | a read that also writes is `read*`, and the composable it wraps takes `base*`                     |
| `app/store/dungeons`                                                                                                                        | 2026-09-03 | a store export whose leaf name collides takes its parent's word, as the import site cannot        |
| `app/store/resource`                                                                                                                        | 2026-09-03 | a `{key}{value}Map` is read in that order — the key's word comes first                            |
| `app/store` — the rest                                                                                                                      | 2026-09-03 | the root stores plus `achievement`, `clicker`, `dashboard`, `post`, `survey`, the editors         |
| `app/composables/message/room`                                                                                                              | 2026-09-03 | `use*` naming, the `{param}Value` `toValue` suffix; an unsubscribable is named for its procedure  |
| `app/composables/message` — `subscribables`, `message`, `slashCommand`, `moderation`                                                        | —          |                                                                                                   |
| `app/composables/message` — the rest                                                                                                        | —          | `emoji`, `draftsAndSent`, `user`, `file`, `editor`, `search`, `poll`, the singles, the root files |
| `app/composables/resource/sheet/commands`                                                                                                   | —          | a command class is named for the edit it applies                                                  |
| `app/composables/resource` — the rest                                                                                                       | —          | `list`, `autosave`, `todoList`, `search`, `recycleBin`, `sheet`'s root files, the root files      |
| `app/composables/dungeons`                                                                                                                  | —          |                                                                                                   |
| `app/composables` — `shared`, `data`                                                                                                        | —          | `useQuery` / `useMutation` and the primitives around them                                         |
| `app/composables` — the small product subdirs and the root files                                                                            | —          |                                                                                                   |
| `app/services/resource/sheet/column` — the root files                                                                                       | —          | filename-is-the-export                                                                            |
| `app/services/resource/sheet/column/transformation`                                                                                         | —          |                                                                                                   |
| `app/services/resource/sheet/commands`                                                                                                      | —          |                                                                                                   |
| `app/services/resource/sheet` — `dataSource`, `csv`, `json`, `xlsx`, the root files                                                         | —          |                                                                                                   |
| `app/services/resource` — the rest                                                                                                          | —          | `list`, `search`, `todoList`, `tag`, `activity`, `survey`, `note`, the root files                 |
| `app/services/message` — `room`, `emoji`                                                                                                    | —          |                                                                                                   |
| `app/services/message` — `moderation`, `settings`, `filter`, `draftsAndSent`, `user`, `roomCategory`, `member`                              | —          |                                                                                                   |
| `app/services/message` — the rest                                                                                                           | —          | `file`, `slashCommands`, `composer`, `poll`, `subscribables`, the singles, the root files         |
| `app/services/dungeons/scene`                                                                                                               | —          |                                                                                                   |
| `app/services/dungeons` — the rest                                                                                                          | —          | `UI`, `monster`, `tilemap`, `direction`, `sound`, `item`, `animation`, `attack`, the singles      |
| `app/services` — `clicker`, `docs`                                                                                                          | —          |                                                                                                   |
| `app/services` — `dashboard`, `shared`, `file`, `cache`                                                                                     | —          |                                                                                                   |
| `app/services` — `emailEditor`, `jsonSchema`, `grapesjs`, `trpc`, `dataset`, `app`, `post`, `auth`                                          | —          |                                                                                                   |
| `app/services` — the rest                                                                                                                   | —          | the third-party adapter trees and the singles                                                     |
| `app/models/dungeons` — `state`, `loader`, `scene`                                                                                          | —          |                                                                                                   |
| `app/models/dungeons` — the rest                                                                                                            | —          | `tilemap`, `keys`, `UI`, `npc`, `input`, `gridEngine`, `area`, the singles, the root files        |
| `app/models/resource/sheet/commands`                                                                                                        | —          |                                                                                                   |
| `app/models/resource/sheet` — `column`, `dataSource`, the root files                                                                        | —          |                                                                                                   |
| `app/models/resource` — the rest                                                                                                            | —          | `list`, `search`, the root files                                                                  |
| `app/models/message`                                                                                                                        | —          |                                                                                                   |
| `app/models` — `resolvers`, `shared`                                                                                                        | —          |                                                                                                   |
| `app/models` — the rest                                                                                                                     | —          | the third-party model trees and the singles                                                       |
| `app/util`, `app/types`                                                                                                                     | —          | a `.d.ts` augmenting a package mirrors that package's spellings                                   |
| `app/components/Message/Model/Message` — `Input`, `Type`, `File`, `List`, `Emoji`, the root files                                           | —          |                                                                                                   |
| `app/components/Message/Model/Message` — the rest                                                                                           | —          | `Suggestion`, `OptionsMenu`, `LinkPreview`, `Reply`, `ReactionsDialog`, `Forward`, `Search`       |
| `app/components/Message/Model/Room/Settings`                                                                                                | —          |                                                                                                   |
| `app/components/Message/Model/Room` — the rest                                                                                              | —          | `List`, `Invite`, `DirectMessage`, `Create`, `Emoji`, `Role`, the root files                      |
| `app/components/Message/Model/User`                                                                                                         | —          |                                                                                                   |
| `app/components/Message/Model` — `FileRenderer`, `Settings`, `RoomCategory`, `Status`, `Member`                                             | —          |                                                                                                   |
| `app/components/Message/Content/Call`                                                                                                       | —          |                                                                                                   |
| `app/components/Message/Content` — the rest, plus `LeftSideBar`, `Friends`                                                                  | —          |                                                                                                   |
| `app/components/Message` — `RightSideBar`, `DraftsAndSent`                                                                                  | —          |                                                                                                   |
| `app/components/Resource/Sheet`                                                                                                             | —          |                                                                                                   |
| `app/components/Resource` — `List`, `Survey`, `VersionHistory`, `TodoList`, `Search`                                                        | —          |                                                                                                   |
| `app/components/Resource` — the rest                                                                                                        | —          | the per-resource-type trees and the root files                                                    |
| `app/components/Dungeons` — `Battle`, `World`, `UI`                                                                                         | —          |                                                                                                   |
| `app/components/Dungeons` — the rest                                                                                                        | —          | `Settings`, `Inventory`, `MonsterParty`, `Title`, `MobileJoystick`, `MonsterDetails`              |
| `app/components/Styled`                                                                                                                     | —          | the shell primitives every product renders                                                        |
| `app/components` — `Clicker`, `Post`                                                                                                        | —          |                                                                                                   |
| `app/components` — `Visual`, `User`                                                                                                         | —          |                                                                                                   |
| `app/components` — `App`, `Docs`, `Dashboard`, `Achievement`                                                                                | —          |                                                                                                   |
| `app/components` — the rest                                                                                                                 | —          | the editor trees, the singles, the root files                                                     |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins`, the `app/` root files                                                          | —          | a route file's name is the URL segment, so it is the router's spelling and not ours               |
| `packages/db`, `packages/db-schema`, `packages/db-mock`                                                                                     | —          | column, table and enum member words are in scope — a rename is one forward migration              |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock`                                                                         | —          |                                                                                                   |
| `packages/virrun`, `packages/infra`, `packages/configuration`                                                                               | —          |                                                                                                   |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`                                                                            | —          | published surfaces — a rename is a breaking change, so raise rather than do                       |

A component file name is in scope for its **words** — the rule spelling `Navigation` over `Nav` reads a filename
the same way it reads any other identifier. The prefix-and-fold question over that same tree stays
`vue-components`'s: one tree, two questions, which is what keeps both ledgers whole. Nothing is excluded here on
the grounds that a rename is expensive — that is the argument
[no compatibility debt](/docs/architecture/no-compatibility-debt) already refuses, migrations included.

## Open findings

- **`readMembersByIds` and `readMessagesByRowKeys` keep a suffix the cardinality rule bans.** Every other
  `*ByIds` read dropped it, but these two share a feature with a paginated read of the same rows
  (`readMembers`, `readMessages`), so the suffix is what separates two procedures rather than marking a batch
  upgrade — and dropping it collides. What the pair should be called instead is the open question.
- **`countEntities` is `packages/db`'s, and it is an async fetch under the `count*` prefix.** Every count
  procedure and service in `packages/app` is now `read*Count`; the storage primitive underneath them keeps
  `count*`, so the question of whether a generic table-client tally is exempt belongs to the `packages/db`
  pass that owns the name.
- **`getIsAuthed` / `getIsRateLimited` / `getIsEntityIdEqualComparator` — `get*` is right, the `Is` is not.**
  All three return a function rather than a boolean, so `check*` would be wrong, but the `Is` still reads as a
  predicate. The middleware pair wants a name saying what it builds; the comparator already has one.

- **The dungeons input path spells one role three ways, and the skill sanctions none of them outright.**
  A scene store's entry point is `onPlayerInput`, the resolver classes it dispatches to declare `handleInput`,
  and the dialog store's own entry point is `handleShowMessageInput` — all three take a `PlayerInput` and answer
  whether they consumed it. The `on*` rule covers a handler that wraps an existing named function, which none of
  these does, so `handle*` is not straightforwardly wrong and renaming one family in isolation would only widen
  the split. Which prefix the family takes is the open question, and it is settled with
  `app/models` — `resolvers`, `shared`, where the abstract classes that fix the method name live.

- **The `block` router's `blockUser` and `unblockUser` procedures name an action, not the row they write.**
  The store side is now `createBlock` / `deleteBlock` against the `blocks` table, and the router already spells
  the pair `Operation.Create` / `Operation.Delete` on `DatabaseEntityType.Block` in its own error constructors —
  but the procedures sit in `server/trpc/routers/block`, whose row was swept before the store pass reached this.
  They go with the next pass over that row.

- **The `callSession` router's `setMute` and `setCamera` procedures name an action, not the field they write.**
  The store side is now `setParticipantMuted` / `setParticipantCameraEnabled` against `isMuted` / `isCameraEnabled`,
  and the rule is now in the `naming` skill — but the procedures sit in `server/trpc/routers/call`, whose row was
  swept before that rule existed. They go with the next pass over that row, along with the `onSetMute` /
  `onSetCamera` subscriptions that mirror them.

## Next enforceable

- Filename-is-the-export is decidable from the AST plus the path; a custom oxlint plugin could take it whole.
- `is*`/`has*`/`show*` on a boolean-typed declaration needs types, which `typeAware: true` already provides.
- Abbreviation bans need a word list, not a rule — leave with the sweep.
- **A `getIs*`/`getHas*` declaration is decidable from the name alone, and the carve-out is now closed.** The
  only ones that may keep the prefix are the three above, which return a function rather than a boolean; every
  other one in the repo is a `check*` the pass has not reached yet. A `no-restricted-syntax` selector on a
  declarator named `^get(Is|Has)[A-Z]` can therefore be written against the swept paths and widened as the
  remaining units drain.
- A where-fragment helper is decidable from the AST alone: a declarator named `*Where` whose initialiser is a
  function must start with `get`. Four routers had written the bare noun, so the rule is now in the `trpc` skill
  and a `no-restricted-syntax` selector can hold it over the swept paths.
- A `const` bound to the call it names — `const readPost = await caller.readPost(…)` — is decidable from the AST alone
  (declarator name equal to the callee's last property), and it is the finding this ledger has now written in five
  files. The fix is always the same: drop the verb prefix, since the binding is the value rather than the fetch.
