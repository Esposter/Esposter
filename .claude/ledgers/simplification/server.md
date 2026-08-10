# Server

| Unit                          | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message` | 2026-08-10 | `getDevice` in `services/auth`; `holdFirstWrite` owns the interleaving fixture                                                                                                                                                                                                                                                                                   |
| `server/trpc/routers/room`    | 2026-08-10 | `createRoomMember`/`createFriends`/`createDirectMessageWithFriend` own the fixtures                                                                                                                                                                                                                                                                              |
| the remaining routers         | —          |                                                                                                                                                                                                                                                                                                                                                                  |
| `server/services`             | 2026-08-10 | Input schemas moved to `shared/models/db/message`, so no service imports a router; `readCursorPaginationDataAzureTable` owns the Azure-Table cursor read; `createRateLimiter`, `readMessageSearchDocuments`, `getLiveKitCredentials` each own one copy; `getInvalidOperationError`/`getNotFoundError` rule → `error-handling`, filename-is-the-export → `naming` |

## Open findings

- `readFollowedThreads` fans out one Azure point read per followed root; the batched query `readMessagesByRowKeys`
  already runs would reorder `threads` and widen its element type past `StandardMessageEntity[]`.
- `onCreateTyping`, `onDeleteMessage` and `onUpdateMessage` hand-roll `getRoomEventSubscription`; generalising it to
  device-less events changes the signature `emoji` and `role` already depend on.
- `routers/message/index.test.ts` (69 inline `createRoom`, 20 invite/join dances) and `emoji.test.ts` (9 and 2)
  still hand-roll what `setupRoomSuite` and the extracted `createRoomMember` now own. `setupRoomSuite` grew
  `updateEveryoneRole(permissions)` for this, which `routers/role.test.ts` can adopt in the remaining-routers pass.
- The single-`partitionKey` clause array plus `serializeClauses` is written out in ~10 non-test files. The primitive
  belongs in `@esposter/db`; the per-feature wrappers (`getSurveyResponseFilter`, `getProgramParticipantFilter`)
  stay valid on top of it.
- The four `message/call/*Map.ts` modules are one aggregate keyed on `callSessionId` — `deleteCallParticipant` tears
  all four down together. Collapsing them touches `routers/call/*`, `api/webhooks/livekit.post.ts` and
  `routers/message/moderation.ts`.
- `joinCallAsParticipant` and `leaveCallAsParticipant` each inline `createSystemRoomMessage`'s body, differing only
  in `MessageType.Call` vs `System`. The `type` parameter they need now exists — three call sites are waiting.
- `messageCompositeKeySchema` and `deleteMessageInputSchema` are byte-identical; collapsing them renames
  `DeleteMessageInput` across `MessageEvents`, the emitter and the client stores.
- `message/isRoomId.ts` is `(a, b) => a === b` with three call sites, all in `routers/message/index.ts`.
- `countSurveyResponses` and `countSurveyResponseEntities` answer one question with different ceilings, so one
  surface reads "1000+" while another reads the real number. Both caps are documented in
  `survey-response-management.md`, so unifying them changes a rendered value.
- `readProgramStatusRows` caps participants and responses at `AZURE_MAX_PAGE_SIZE` each, so `isResponded` is
  silently wrong past the cap.
- `resolveIdentifiedToken` reads every one of the owner's Program blobs on every identified submission, because the
  survey binding lives in blob content rather than a column. Fixing it needs a schema change and a migration.
- `captureBlueprint`, `deployBlueprint` and `duplicateResource` share one rollback tail; extracting it means passing
  `deployBlueprint`'s `createdIds` by reference before it is populated.
- `assertIsRoom` reports `DatabaseEntityType.UserToRoom` from a guard that reads `roomsInMessage`; five inline
  snapshots assert the current text.
- `services/message/events/` holds four emitters with no message consumer (`friend`, `user`, `role`, `room`);
  `achievement/events/` is the precedent for a feature owning its own.
- `webhookRateLimiter` and `assetRateLimiter` carry no `keyPrefix` while both procedure limiters do, and the shared
  table invariant is stated in a comment rather than enforced.
- `getContentBlobName`, `hasPermission` and `getPermissions` in `server/services` are pure re-export lines for
  `@esposter/db`. `CLAUDE.md` documents the pattern, so either the skill blesses it or the indirection goes.
