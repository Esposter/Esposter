# Server

| Unit                          | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message` | 2026-08-10 | `getDevice` in `services/auth`; `holdFirstWrite` owns the interleaving fixture                                                                                                                                                                                                                                                                                   |
| `server/trpc/routers/room`    | 2026-08-10 | `createRoomMember`/`createFriends`/`createDirectMessageWithFriend` own the fixtures                                                                                                                                                                                                                                                                              |
| the remaining routers         | 2026-08-10 | Two authorization defects fixed; 33 hand-rolled `TRPCError`s onto the guard constructors, with `getForbiddenError` added as the third; `withResourceRollback` and a `Transaction` alias each own one home                                                                                                                                                        |
| `server/services`             | 2026-08-10 | Input schemas moved to `shared/models/db/message`, so no service imports a router; `readCursorPaginationDataAzureTable` owns the Azure-Table cursor read; `createRateLimiter`, `readMessageSearchDocuments`, `getLiveKitCredentials` each own one copy; `getInvalidOperationError`/`getNotFoundError` rule → `error-handling`, filename-is-the-export → `naming` |

## Open findings

- The single-`partitionKey` clause array plus `serializeClauses` is written out in ~10 non-test files. The primitive
  belongs in `@esposter/db`; the per-feature wrappers (`getSurveyResponseFilter`, `getProgramParticipantFilter`)
  stay valid on top of it.
- The four `message/call/*Map.ts` modules are one aggregate keyed on `callSessionId` — `deleteCallParticipant` tears
  all four down together. Collapsing them touches `routers/call/*`, `api/webhooks/livekit.post.ts` and
  `routers/message/moderation.ts`.
- `DeleteMessageInput` is now an alias of `messageCompositeKeySchema` rather than a second copy, but two names for
  one schema remain. Deleting the file means `routers/message/index.ts` uses the composite key directly, which
  renames the type across `MessageEvents`, the emitter and the client stores.
- `countSurveyResponses` and `countSurveyResponseEntities` answer one question with different ceilings, so one
  surface reads "1000+" while another reads the real number. Both caps are documented in
  `survey-response-management.md`, so unifying them changes a rendered value.
- `readProgramStatusRows` caps participants and responses at `AZURE_MAX_PAGE_SIZE` each, so `isResponded` is
  silently wrong past the cap.
- `resolveIdentifiedToken` reads every one of the owner's Program blobs on every identified submission, because the
  survey binding lives in blob content rather than a column. Fixing it needs a schema change and a migration.
- `assertIsRoom` reports `DatabaseEntityType.UserToRoom` from a guard that reads `roomsInMessage`; five inline
  snapshots assert the current text.
- `services/message/events/` holds four emitters with no message consumer (`friend`, `user`, `role`, `room`);
  `achievement/events/` is the precedent for a feature owning its own.
- `webhookRateLimiter` and `assetRateLimiter` carry no `keyPrefix` while both procedure limiters do, and the shared
  table invariant is stated in a comment rather than enforced.
- `getContentBlobName`, `hasPermission` and `getPermissions` in `server/services` are pure re-export lines for
  `@esposter/db`. `CLAUDE.md` documents the pattern, so either the skill blesses it or the indirection goes.

Raised out of `the remaining routers` (2026-08-10):

- `achievement.readUserAchievements` runs on the unauthenticated rate-limited procedure and returns any user's rows
  including locked and in-progress ones, while `readAchievementMap` masks hidden descriptions and
  `readPointsLeaderboard` filters to unlocked. Possibly intended for public profiles — confirm before changing.
- `revokeRole` has no `requireMutation` on its delete, so revoking a role the member never held silently succeeds,
  unlike `deleteRole`. Whether that should reject is a product decision.
- `post.ts`'s `readPost` and `readPosts` each duplicate their whole query to swap `with: PostRelations` for
  `getViewerPostRelations(userId)`. Collapsing to a ternary bets on drizzle's const-generic inference over a union.
- The return-generic pass is partial: `resource.ts`'s `OffsetPaginationData<ResourceListItem>`, `readWebhooks` (no
  `WebhookInMessageWithRelations` type exists) and `achievement.ts`'s map and leaderboard shapes have no exported
  name to annotate with, and a wrong annotation widens silently.
- `webhook.ts`'s `rotateToken` and `updateWebhook` remain twins past the shared where-fragment; only the `.set()`
  payload differs, so extracting further would parameterise the whole body.
- `role.test.ts` has a bare `getMockSession();` statement whose only effect is consuming the queued once-session.
  It reads as dead code; the fix is a named `consumeMockSessionOnce()` in `context.test.ts`'s vocabulary.
