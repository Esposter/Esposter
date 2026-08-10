# Server

| Unit                          | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message` | 2026-08-10 | `getDevice` in `services/auth`; `holdFirstWrite` owns the interleaving fixture                                                                                                                                                                                                                                                                                   |
| `server/trpc/routers/room`    | 2026-08-10 | `createRoomMember`/`createFriends`/`createDirectMessageWithFriend` own the fixtures                                                                                                                                                                                                                                                                              |
| the remaining routers         | 2026-08-10 | Two authorization defects fixed; 33 hand-rolled `TRPCError`s onto the guard constructors, with `getForbiddenError` added as the third; `withResourceRollback` and a `Transaction` alias each own one home                                                                                                                                                        |
| `server/services`             | 2026-08-10 | Input schemas moved to `shared/models/db/message`, so no service imports a router; `readCursorPaginationDataAzureTable` owns the Azure-Table cursor read; `createRateLimiter`, `readMessageSearchDocuments`, `getLiveKitCredentials` each own one copy; `getInvalidOperationError`/`getNotFoundError` rule → `error-handling`, filename-is-the-export → `naming` |

## Open findings

- `readProgramStatusRows` caps participants and responses independently, so `isResponded` is silently wrong
  past the cap. Decision: surface `hasMore` and warn like the dataset surfaces (recommended), walk every
  response page, or paginate the join.
- **Every Azure Table row key is a bare `getReverseTickedTimestamp()`**, at all five writers (messages,
  message emoji metadata, moderation log, moderation notes, resource activity). The key is unique only per
  millisecond per partition, so two writes to one partition in the same millisecond collide: the second is
  rejected `409`. `writeResourceActivity` demonstrates it today — creating a resource and saving its content
  in one tick writes `Created` and `ContentSaved` to the same key, and the second is swallowed by the
  best-effort `.match(noop, console.error)` (visible as the two `409`s in `achievement.test.ts`'s stderr).
  For messages the same race throws at the user. Decision: append a disambiguating suffix to the row key
  (recommended — ordering is unchanged because the timestamp stays the prefix, but it is a key-shape change
  that touches cursors and existing rows), or make each writer retry the next tick.
- `resolveIdentifiedToken` reads every one of the owner's Program blobs per identified submission, because
  the survey binding lives in blob content. Decision: a `resources` column plus migration and backfill
  (recommended, when a migration is in flight anyway), a token index table, or leave it.
- `readWebhooks` and `post.ts`'s `readPost`/`readPosts` both wait on a type that does not exist yet
  (`WebhookInMessageWithRelations`, a `readPosts` return type). Both are one-line additions in
  `packages/db-schema`, outside this ledger's unit.
