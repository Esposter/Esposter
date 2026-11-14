# Account Deletion

The Delete account card in user settings removes one account and the content it owns. A typed confirmation starts the sweep, which walks each store the [user data inventory](../../architecture/user-data-inventory/design.md) lists as keyed to the account. Each row of that inventory names the removal its store gets. The account's row is deleted last, so a sweep that fails partway is replayed from the same event until nothing is left.

## The request

`user.deleteAccount` in `apps/web/server/trpc/routers/user.ts` writes `deletionRequestedAt` on the user row, publishes one `DeleteAccount` event carrying the user id, and then ends every session the account holds. A publish that fails fails the request, and the sessions stay open. `deleteAccountSessions` ends the sessions: it revokes each one by the token it was read with and closes that session's device connections, so the caller is signed out everywhere.

The mutation does not sweep. A sweep across message partitions and blob directories can outlast a request, so the caller is answered once the event is accepted.

```mermaid
sequenceDiagram
  participant Person
  participant Mutation as user.deleteAccount
  participant DB as Postgres
  participant EG as Event Grid
  Person->>Mutation: Confirm with the typed display name
  Mutation->>DB: Set deletionRequestedAt
  Mutation->>EG: Publish DeleteAccount with the user id
  alt publish fails
    Mutation-->>Person: Error, still signed in
  else publish accepted
    Mutation->>DB: End each session
    Mutation-->>Person: Signed out
  end
```

The confirmation lives in `apps/web/app/components/User/DeleteAccountCard/Index.vue`, which the settings page mounts for a signed-in person. It opens the shared `apps/web/app/components/Ui/ConfirmDialog.vue`, whose confirm button stays disabled until the typed name matches the person's display name. The dialog lists the kinds of content the deletion keeps, from `AccountDeletionKeptItems`.

## The sweep

The `DeleteAccount` function (`apps/functions/src/functions/deleteAccount.ts`) passes the user id to `deleteAccountHandler`, which runs the steps below in this order. A step that throws fails the invocation.

```mermaid
flowchart TD
  Event["DeleteAccount event"] --> Rooms["Owned rooms<br/>partitions, search documents, prefixes, room row"]
  Rooms --> Resources["Owned resources<br/>purge per resource"]
  Resources --> Messages["Messages in member rooms<br/>erase, then soft delete"]
  Messages --> Reactions["Reactions in member rooms<br/>remove or unshare"]
  Reactions --> Charged["Charged blobs<br/>from the storage ledger"]
  Charged --> Prefixes["User blob prefixes"]
  Prefixes --> Exports["Export archives<br/>named by dataExports rows"]
  Exports --> Actors["Moderation actors<br/>blanked"]
  Actors --> User["User row<br/>deleted last"]
```

The order is the mechanism. The user row goes last because its cascade removes the `dataExports` rows that name the export archives, so the archives must be removed first.

1. **Owned rooms.** Each room the account owns is deleted one at a time, as an owner's departure deletes it: `leaveRoom` deletes the room for everyone when its owner leaves. The step clears the room's partitions in three tables, `Messages`, `MessagesAscending` and `MessagesMetadata`, and then deletes the room's documents from the `messages-index` search index, which the indexer filled from the `Messages` partition. It removes the `{roomId}/` prefix in `MessageAssets` and the `rooms/{roomId}/` prefix in `PublicUserAssets`, which holds the room's profile images, and it deletes the room row last, since a replay finds the room by that row. The room's moderation log and notes go with that row by cascade. `deleteRoom` publishes the attachment prefix and the profile images as Event Grid work, but it does not clear the partitions or the index documents, so the sweep runs its own deletes.
2. **Owned resources.** Each resource the account owns goes through `purgeResourceAndBroadcast`, the purge the recycle bin's timer runs: its directory, then its ledger rows, then the row, whose cascade removes what the resource owns in the database, in the order that makes a replay safe.
3. **Messages in member rooms.** The sweep reads the memberships that remain once the owned rooms are gone. In each of those rooms it erases the account's messages through `eraseRoomMessagesByUser`: the text, the files and the link preview are cleared, and the row is soft-deleted. A moderation ban only soft-deletes, which hides a message without clearing its text, so the sweep does more than the ban does. The write is a Replace conditional on the etag the message was listed with, so a message another write changed meanwhile fails the step, and the replay lists it again. It passes a no-op for the announcement, so an open room keeps showing the messages until it reloads.
4. **Reactions in member rooms.** In each of those rooms, an emoji row the account reacted to is deleted when the account is its only reactor. Otherwise the account is taken out of its reactor list. Each write is conditional on the row's etag, so a row another member changed meanwhile fails the step, and the replay reads it again. The rule is `checkIsOnlyReactor` and `getUpdatedUserIds` in `packages/shared`, which the emoji router and the client store also use. No announcement goes out, so an open room shows a removed reaction on its next load.
5. **Charged blobs.** `listChargedBlobsByUser` reads the account's rows in the storage ledger, grouped by container. `deleteStorageBlobs` removes each container's blobs through the release a blob deletion runs, which drops their ledger rows and broadcasts the storage usage change. The sweep never lists a directory to find these files.
6. **Blob prefixes.** `deleteUserDirectories` removes everything under `{userId}/` in `GenshinAssets`, `PublicUserAssets`, `UserAssets` and `ClickerAssets`. It is a prefix delete that lists no names, and an empty prefix counts as done. The clicker and user-assets containers each hold the person's `save.json` under the prefix, the clicker's and the dungeon save respectively.
7. **Export archives.** `deleteAccountDataExportArchives` reads the `blobName` of each `dataExports` row the account owns. It skips a row that names no blob, which is a queued export with no archive yet, and deletes the named blobs in `UserAssets` through `deleteBlobs`. The archive is named by its export id under `exports/` and sits under no user prefix, so its row is the only way to find it. An archive an earlier attempt already removed counts as done.
8. **Moderation actors.** `clearAccountModerationActor` sets the account's `actorUserId` to null on every moderation log row it took as a moderator, in every room, so each room keeps the record without the person's name. It is one update, served by the actor index, and a replay finds no rows left to blank.
9. **User row.** The `usersInAuth` row is deleted last. Its cascade removes the `accounts` rows, the `dataExports` rows and the other rows that reference the user with a cascade. No step deletes those by hand.

A profile image's write SAS outlives the request that minted it, so an image can land in `PublicUserAssets` after the sweep has passed. `DeleteOrphanedProfileImage` (`apps/functions/src/handlers/deleteOrphanedProfileImageHandler.ts`) deletes that landing when the account row is gone or carries `deletionRequestedAt`, and keeps it for an account in use. It is the one reader of the marker outside the mutation.

Every step treats an already-gone target as done. A 404 from a blob delete counts as done in `deleteBlobs`, an empty prefix is done, and a blob an earlier attempt removed does not fail the rest of its container in `deleteStorageBlobs`. A failed step fails the invocation. Event Grid delivers at least once, and `AzureFunctionIsIdempotentMap` marks `DeleteAccount` idempotent, so a replay runs every step again and finds only what is left.

## Decisions

**The marker is the row, and the user row goes last.** A resource's purge already works this way: the Postgres row is the durable marker, every external sweep treats an already-gone target as success, and the row is deleted last, so a replay after any failure finds the same work. Deleting the user row first would cascade away the rows that still name the work.

**The publish comes before the sessions.** A failed publish fails the request with the person still signed in, and the person can confirm again. The marker is written first, so a failed publish leaves `deletionRequestedAt` set. The sweep does not read the column, since it takes the account from the event, and a retry sets it again.

**Owned rooms are deleted, as an owner's departure deletes them.** Account deletion does what `leaveRoom` already does for an owner, rather than inventing a transfer. Transferring ownership is a feature with its own design, and it is the reason to revisit this.

**Messages leave, and reactions are unshared.** A message is attributed to its author, so the sweep removes the author's content from every room the account is still in. A reaction is one row shared by everyone who reacted with that emoji, so the sweep takes the account out of a shared row and deletes a row it holds alone, as the reaction's own removal does. The erase and the soft delete both live in `packages/db`, beside the batch loop they share, so the functions app and the web app run one implementation.

**The index follows the table through the indexer, except where a row is deleted.** An erased message stays a row, so the indexer's next pull writes its empty form over the indexed one. The indexer does not detect deleted rows, so an owned room's documents are deleted by the sweep, by partition key, once its partitions are cleared.

**Nothing is announced to open rooms.** A moderation ban publishes each batch it commits, so members watch messages leave. The sweep passes a no-op for that and sends no announcement for reaction removals, so open rooms show both changes on reload. A live announcement was decided against ([rejected](../../../rejected/esbabbler/deleted-account-live-removal/proposal.md)).

**Blob directories are swept by prefix, and the archive by its row.** A user's `{userId}/` prefix holds what they wrote in the containers above, so the sweep lists no names. The export archive sits under no prefix, so the sweep reads its row instead.

**Resources go through the purge that exists.** `purgeResource` already deletes a resource's directory and ledger rows, then the row, in a safe order, so each owned resource is passed to it.

**The `accounts` foreign key cascades.** It cascades in the schema, because a non-cascading key would block the user row's deletion. The deletion then declares what it removes, and no step deletes accounts by hand.

## Rejected

- **Sweeping inside the mutation.** It makes the caller wait on blob listings and partition scans, and a failure halfway leaves the answer unknown.
- **Anonymising messages instead of deleting them.** It keeps the content, which is what a deletion is for.
- **Transferring owned rooms.** It adds an ownership model the platform does not have.

## Limits the spec states

- Messages a person wrote in a room they have since left stay attributed to them. Membership is the only index from a user to a room.
- Moderation records in other people's rooms where the user is the moderator, and resource activity on resources the user does not own, are kept as the platform's audit trail, with the moderator's id set to null by the sweep. Moderation records that name the user as target go with the account. Whether that retention is lawful is an owner decision.
- The Azure AI Search index holds an erased member-room message's old text until the indexer's next pull, at most one schedule interval after the sweep. Owned-room documents do not outlive the sweep, which deletes them by partition key ([message search](../../esbabbler/message-search/design.md)).

## Key files

| Path                                                                                             | Role                                                         |
| :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| `apps/web/server/trpc/routers/user.ts`                                                           | The `deleteAccount` mutation                                 |
| `apps/web/server/services/user/deleteAccountSessions.ts`                                         | Ends the account's sessions and their device connections     |
| `apps/web/app/components/User/DeleteAccountCard/Index.vue`                                       | The Delete account card and its typed confirmation           |
| `apps/web/app/components/Ui/ConfirmDialog.vue`                                                   | The confirmation dialog that gates on the typed name         |
| `apps/web/app/services/user/settings/AccountDeletionKeptItems.ts`                                | The kept list the confirmation names                         |
| `packages/db-schema/src/schema/auth/usersInAuth.ts`                                              | The `deletionRequestedAt` marker                             |
| `packages/db-schema/src/schema/auth/accountsInAuth.ts`                                           | The `accounts` foreign key, cascading                        |
| `packages/db-schema/src/services/azure/function/AzureFunctionIsIdempotentMap.ts`                 | Marks `DeleteAccount` idempotent                             |
| `apps/functions/src/functions/deleteAccount.ts`                                                  | The event registration                                       |
| `apps/functions/src/handlers/deleteAccountHandler.ts`                                            | The sweep, in order                                          |
| apps/functions/src/services/account/clearAccountModerationActor.ts                               | Blanks the moderator id on the account's moderation log rows |
| `apps/functions/src/services/account/`                                                           | One service per step                                         |
| `apps/functions/src/handlers/deleteOrphanedProfileImageHandler.ts`                               | Removes a profile image that lands after the sweep           |
| `packages/db/src/services/message/softDeleteRoomMessagesByUser.ts`                               | The message soft delete, shared with moderation              |
| `packages/db/src/services/message/eraseRoomMessagesByUser.ts`                                    | The erase in member rooms, which the sweep runs              |
| `packages/db/src/services/message/updateRoomMessagesByUser.ts`                                   | The batch loop the erase and the soft delete share           |
| `packages/db/src/services/azure/search/deleteSearchDocumentsByFilter.ts`                         | Deletes a room's documents from the search index             |
| `apps/functions/src/services/azure/getSearchClient.ts`                                           | The search client the sweep writes with, by managed identity |
| `packages/db/src/services/resource/purgeResource.ts`                                             | The purge each owned resource goes through                   |
| `packages/db/src/services/storage/listChargedBlobsByUser.ts`                                     | Reads the account's storage ledger rows                      |
| `packages/db/src/services/storage/deleteStorageBlobs.ts`                                         | Removes charged blobs and releases their charge              |
| `packages/db/src/services/azure/container/deleteUserDirectories.ts`                              | The `{userId}/` prefix sweep                                 |
| `packages/shared/src/services/message/emoji/checkIsOnlyReactor.ts`                               | The reaction rule, shared with the emoji router              |
| `packages/shared/src/services/message/emoji/getUpdatedUserIds.ts`                                | The reaction rule, shared with the emoji router              |
| `apps/web/server/trpc/routers/message/emoji.ts`                                                  | The emoji router, which applies the same reaction rule       |
| `apps/infra/src/azure/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAe010.ts`  | The dev subscription for `DeleteAccount`                     |
| `apps/infra/src/azure/resources/Microsoft.EventGrid/eventSubscriptions/prodEvgsEsposterAe010.ts` | The prod subscription for `DeleteAccount`                    |
