# Server

| Unit                          | Swept      | Notes                                                                               |
| ----------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `server/trpc/routers/message` | 2026-08-10 | `getDevice` in `services/auth`; `holdFirstWrite` owns the interleaving fixture      |
| `server/trpc/routers/room`    | 2026-08-10 | `createRoomMember`/`createFriends`/`createDirectMessageWithFriend` own the fixtures |
| the remaining routers         | —          |                                                                                     |
| `server/services`             | —          | helpers the routers share                                                           |

## Open findings

- `readFollowedThreads` fans out one Azure point read per followed root; the batched query `readMessagesByRowKeys`
  already runs would reorder `threads` and widen its element type past `StandardMessageEntity[]`.
- Thirteen input schemas and the exported `ReadMessagesInput` live in `routers/message/index.ts`, so
  `services/message/readMessages.ts` imports a type from a tRPC router. They belong in `shared/models/db/message/`.
- `onCreateTyping`, `onDeleteMessage` and `onUpdateMessage` hand-roll `getRoomEventSubscription`; generalising it to
  device-less events changes the signature `emoji` and `role` already depend on.
- `deleteBan`'s existence probe folds into the delete's `.returning()`, but the rejection message would change from
  `NotFoundError` to `InvalidOperationError`.
- The Azure-Table cursor read (`clauses` → `getCursorWhereAzureTable` → `getTopNEntities(limit + 1)` →
  `getCursorPaginationData`) is written out by `readModerationLog`, `readModerationNotes` and `routers/resource.ts`.
- Ten procedures in `routers/message/index.ts` still infer their output instead of carrying the `trpc` skill's
  `.query<T>` / `.mutation<T>` return generic.
- `pinMessage`'s best-effort system message duplicates `services/message/createSystemRoomMessage`, which hardcodes
  `MessageType.System`.
- `files.flatMap(({ filename, id }) => Object.values(getFileBlobNames(prefix, id, filename)))` appears in
  `deleteMessage`, `deleteUploadFiles` and `softDeleteRoomMessagesByUser` — one `getFilesBlobNames` in
  `@esposter/db`, which needs a barrel regen.
- `{ key: createdAt, order: Desc }` is declared six times across the router and the `ReadBans`/`ReadModerationLog`/
  `ReadModerationNotes`/`ReadMySentMessages` input schemas.
- `routers/message/index.test.ts` (69 inline `createRoom`, 20 invite/join dances) and `emoji.test.ts` (9 and 2)
  still hand-roll what `setupRoomSuite` and the extracted `createRoomMember` now own.
