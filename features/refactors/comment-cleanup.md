# Comment Cleanup — Sweep Ledger

Goal: make every comment tight, generic, and correctly placed across the repo, per the conventions in `.claude/skills/file-organization/SKILL.md` (**Whitespace & Comments**). This file tracks which files have already been swept so future passes can skip them and resume where we left off.

---

## Conventions (summary — full rules in the skill)

- No blank line **before or after** a `//` comment; the comment is the separator. **Exception**: `.test.ts`/`.test-d.ts` keep blanks required by `vitest/padding-around-*`.
- Keep comments tight and generic — explain the _why_, drop concrete example values (versions, IDs, payloads, magic numbers). Single line preferred; keep a numbered/bulleted list when enumerating distinct items.
- Keep quoted error/warning text (e.g. `[Vue warn]: Invalid prop`) — trimmed to the minimal identifying fragment — so it stays greppable.
- Local `interface`/`type` declarations grouped at the top of the block (after imports).
- Applies to `//`, `/* */`, and Vue `<!-- -->` comments alike.

---

## Swept files

Files whose comments have been reviewed and cleaned. Listed only if they had comments worth touching; files with no comments are out of scope.

### Vue components

- `app/components/Visual/Card/Carousel.vue` — major rewrite of the over-commented animation block + scss; interfaces hoisted, blank-before-comment removed
- `app/components/Visual/Card/Marquee.vue`
- `app/components/Visual/Card/Switch.vue`
- `app/components/Visual/Desmos/DisplayGraph.vue`
- `app/components/Dashboard/Visual/Index.vue`
- `app/components/Dungeons/World/Character/Index.vue`
- `app/components/Dungeons/World/Character/Player.vue`
- `app/components/Dungeons/World/Map/Foreground.vue`
- `app/components/Dungeons/UI/Bar/Container.vue`
- `app/components/Dungeons/MonsterParty/InfoContainer.vue`
- `app/components/Dungeons/Settings/Menu/VolumeSlider.vue`
- `app/components/Dungeons/Battle/Menu/Panel/Info.vue`
- `app/components/Post/Card.vue`
- `app/components/TableEditor/File/Column/CreateDialogButton.vue`
- `app/components/TableEditor/File/Column/EditDialogButton.vue`
- `app/components/TableEditor/File/Row/CreateDialogButton.vue`
- `app/components/TableEditor/VuetifyComponent/ComponentAutocomplete.vue`
- `app/components/Message/Model/Message/List/Index.vue`
- `app/components/Message/Model/Message/Type/ListItem.vue`
- `app/components/Message/RightSideBar/Search/Input.vue`

### App / shared / server TS

- `app/store/layout.ts`
- `app/store/message/data.ts`
- `app/store/dungeons/settings/scene.ts`
- `app/store/dungeons/inventory/input.ts`
- `app/store/dungeons/dialog.ts`
- `app/services/shared/createOperationData.ts`
- `app/services/jsonSchema/zodToJsonSchema.ts`
- `app/composables/useReadData.ts`
- `app/composables/message/file/useUploadFiles.ts`
- `app/composables/message/search/useReadSearchedMessages.ts`
- `app/composables/data/pagination/offset/useOffsetPaginationDataMap.ts`
- `app/composables/data/pagination/cursor/useCursorPaginationOperationData.ts`
- `configuration/experimental.ts`
- `shared/models/message/events/MessageEvents.ts`
- `shared/models/tableEditor/file/column/transformation/ColumnTransformationType.ts`
- `shared/models/clicker/data/effect/EffectConfiguration.ts`
- `shared/services/pagination/constants.ts`
- `server/trpc/routers/message/index.ts`
- `server/trpc/procedure/room/getMemberProcedure.ts`
- `server/services/achievement/checkAchievementCondition.ts`

---

## Intentionally left as-is

- `configuration/plugins/fixAjv.ts` + `fixAjv.test.ts` — the numbered transform-step list is a deliberate reference; wording already tight.
- `shared/types/nuxt.d.ts`, `shared/types/desmos.d.ts` — vendored/upstream-synced type augmentations.
- `app/util/math/random/getRandomValues.ts` — single source-URL reference comment.

---

## How to run the next sweep

1. Find verbose single-line comments: `Grep` `^\s*//.{90,}` over `packages/app` (`*.ts`, `*.vue`).
2. Find blank-before-comment: multiline `Grep` `\n[ \t]*\n[ \t]*//` (skip `.test.ts`/`.test-d.ts` and the import→body boundary).
3. Find block comments: `/\*` over `*.vue` (ignore `import.meta.glob` path hits) and `*.ts`.
4. Skip anything already listed above. Append newly-swept files here.
