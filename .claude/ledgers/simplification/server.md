# Server

| Unit                          | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message` | 2026-08-10 | `getDevice` in `services/auth`; `holdFirstWrite` owns the interleaving fixture                                                                                                                                                                                                                                                                                   |
| `server/trpc/routers/room`    | 2026-08-10 | `createRoomMember`/`createFriends`/`createDirectMessageWithFriend` own the fixtures                                                                                                                                                                                                                                                                              |
| the remaining routers         | 2026-08-10 | Two authorization defects fixed; 33 hand-rolled `TRPCError`s onto the guard constructors, with `getForbiddenError` added as the third; `withResourceRollback` and a `Transaction` alias each own one home                                                                                                                                                        |
| `server/services`             | 2026-08-10 | Input schemas moved to `shared/models/db/message`, so no service imports a router; `readCursorPaginationDataAzureTable` owns the Azure-Table cursor read; `createRateLimiter`, `readMessageSearchDocuments`, `getLiveKitCredentials` each own one copy; `getInvalidOperationError`/`getNotFoundError` rule → `error-handling`, filename-is-the-export → `naming` |

## Open findings

- `countSurveyResponses` caps at `AZURE_MAX_PAGE_SIZE` while `countSurveyResponseEntities` caps at
  `DATASET_MAX_COUNTED_ROWS`, so one survey renders "1000+" on the overview and its real total on the
  Responses blade. Decision: unify on the higher cap (recommended), the lower cap, or keep both.
- `readProgramStatusRows` caps participants and responses independently, so `isResponded` is silently wrong
  past the cap. Decision: surface `hasMore` and warn like the dataset surfaces (recommended), walk every
  response page, or paginate the join.
- `resolveIdentifiedToken` reads every one of the owner's Program blobs per identified submission, because
  the survey binding lives in blob content. Decision: a `resources` column plus migration and backfill
  (recommended, when a migration is in flight anyway), a token index table, or leave it.
- `achievement.readUserAchievements` is deliberately public (`users/public-profile.md`), but returns locked
  and in-progress rows for any user id while its only other-user consumer renders unlocked only. Decision:
  filter the other-user arm to unlocked (recommended) or leave it.
- `readWebhooks` and `post.ts`'s `readPost`/`readPosts` both wait on a type that does not exist yet
  (`WebhookInMessageWithRelations`, a `readPosts` return type). Both are one-line additions in
  `packages/db-schema`, outside this ledger's unit.
