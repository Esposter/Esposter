# User Data Inventory

Every place the platform keeps data that belongs to one account, with how each one is keyed to that account and what removes it today. Account deletion and data export both read this page: a store missing here is a store a deletion would leave behind and an export would omit. It describes the code as it stands; a change to a store updates its row here in the same change.

## Postgres

Every table with a foreign key to the user table, and what its key does when the user row is deleted.

| Table                                                                                                                                                                                                               | Keyed by                        | On user delete                                                                                                                                                                                                                                   |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accounts` (OAuth and credential tokens)                                                                                                                                                                            | `userId`                        | Cascade, removed with the user row, which the sweep deletes last                                                                                                                                                                                 |
| `sessions`, `apiKeys`                                                                                                                                                                                               | `userId` (or `referenceId`)     | Cascade, removed with the user row, which the sweep deletes last                                                                                                                                                                                 |
| `rooms` and its children (`usersToRooms`, `usersToRoomRoles`, `roomMemberPermissions`, `roomCategories`, `bans`, `invites`, `searchHistories`, `callSessions`, `scheduledMessageJobs`, `threadFollows`, `webhooks`) | `rooms.userId` is the owner     | Owned rooms: the sweep clears each one's partitions, attachment prefix and profile images, then deletes the room row, and the cascade takes its children. Memberships in other rooms cascade with the user row. `bans.bannedByUserId` sets null. |
| `resources` and its children (`resourceVersions`, `resourceVersionAssets`, `resourceWorkingAssets`, `resourcePublications`, `resourceLinks`, `resourceAccesses`, `resourceFavorites`)                               | `resources.userId` is the owner | Owned resources: the sweep purges each through `purgeResource`, its directory, its table partitions and its ledger rows, then the row. The cascade takes its children.                                                                           |
| `posts`, `likes`, `friends`, `friendRequests`, `blocks`, `notifications`, `pushSubscriptions`, `bookmarks`, `userAchievements`, `userSettings`, `userStatuses`                                                      | `userId`                        | Cascade, removed with the user row, which the sweep deletes last                                                                                                                                                                                 |
| `storageLedger`                                                                                                                                                                                                     | `userId`                        | The sweep removes the charged blobs from the ledger with their rows, and each owned room's prefix and each owned resource's purge release theirs. The cascade drops any row left, without releasing its bytes                                    |

Rate limiting and verification rows also carry the user id, and both expire on their own.

## Azure Table

| Table                              | Partitioned by; user field             | Removed today                                                                                                                                                                                                                                                    |
| :--------------------------------- | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Messages`                         | room id; `userId`, `mentions`, `files` | Soft delete. The sweep soft-deletes the user's messages in each member room, and clears the partition of each owned room. The moderation ban sweep soft-deletes one user's messages in one room. Deleting a room outside the sweep does not clear its partition. |
| `MessagesMetadata` (reactions)     | room id; `userIds`                     | Removed when the reactor is the sole reactor. The sweep does the same in each member room, and takes the user's id out of the reactions it shares there. An owned room's partition is cleared with the room.                                                     |
| `ModerationLog`, `ModerationNotes` | room id; `actorUserId`, `targetUserId` | Cleared with each owned room's partition. Records in other rooms that name the user are kept.                                                                                                                                                                    |
| `ResourceActivity`                 | resource id; `userId`, `apiKeyId`      | With the resource, by `purgeResource`. The user's activity on other people's resources is kept.                                                                                                                                                                  |
| `ProgramParticipants`              | resource id; a key value and a token   | With the resource, by `purgeResource`                                                                                                                                                                                                                            |
| `SurveyResponses`                  | resource id; a participant token       | Per response, and with the resource by `purgeResource`                                                                                                                                                                                                           |

## Blob containers

| Container                         | Path                                                                                        | Keyed by                                    | Removed today                                                                                                                                                                      |
| :-------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ResourceAssets`                  | `{resourceId}/…`                                                                            | The resource, charged to its owner          | With the resource, by `purgeResource`                                                                                                                                              |
| `MessageAssets`                   | `{roomId}/{fileId}`, its `.thumb`, `emoji/{id}`                                             | The room; a file is charged to its uploader | With its message's file, by the ban sweep, or by a room's prefix deletion. The sweep removes an owned room's files by its prefix, and the user's charged files through the ledger. |
| `PublicUserAssets`                | `{userId}/ProfileImage`, `rooms/{roomId}/ProfileImage*`                                     | The user or the room                        | A room's images with the room, by the sweep's owned-room step. The user's `{userId}/` prefix, by its blob-directory step.                                                          |
| `PrivateUserAssets`               | `{userId}/CallBackground/{slot}`                                                            | The user                                    | One slot at a time. The user's `{userId}/` prefix, by the sweep's blob-directory step.                                                                                             |
| `GenshinAssets`                   | `{userId}/save.json`, `{userId}/character-packs.json`, `character-packs/staging/{userId}/…` | The user                                    | Staging is released after a keep. The sweep removes the user's `{userId}/` prefix and its staging prefix.                                                                          |
| `ClickerAssets`, `DungeonsAssets` | `{userId}/save.json`                                                                        | The user                                    | The sweep's blob-directory step removes the user's `{userId}/` prefix. `DungeonsAssets` is publicly readable by URL.                                                               |
| `GenshinAssets`                   | `character-packs/files/{sha256}`                                                            | Shared by content hash across accounts      | Never. There is no reference count.                                                                                                                                                |

## Other stores

- **The storage ledger** holds one row per charged blob, with its container, its name and its owner. It is the one exact list of the blobs a user is charged for.
- **Azure AI Search** (`messages-index`) holds message text, the author's id and filenames. A pull indexer fills it from the `Messages` table on a schedule. Nothing deletes from it, and whether the indexer drops soft-deleted messages is not recorded.
- **Web PubSub** carries room traffic and per-user groups. Both are transient.
- **Event Grid and Service Bus** carry transient payloads, including the scheduled-message and reminder queues.
- **The browser** keeps recent pages per device. Nothing server-side is involved.

## Ownership rules that shape a sweep

- A room has one owner, `rooms.userId`. Leaving a room as its owner deletes the room for everyone, through `deleteRoom`. No transfer path exists.
- A resource has one owner, `resources.userId`, enforced by `getOwnerProcedure`. No sharing model exists.
- A message is attributed to its author in the `Messages` partition of its room. There is no index from a user to their messages.

## Known gaps

A deletion or an export cannot be complete while these hold, and each one is named where it is decided.

1. A deleted room's message index, `MessagesAscending`, outlives the room. The sweep clears the four partitions the design names, and this index is not one of them (`user-account-deletion/design.md`, "Owned rooms are deleted, as an owner's departure already deletes them").
2. Messages a user wrote in rooms they have since left stay attributed to them, because membership is the only index (`user-account-deletion/design.md`, "Limits the spec states").
3. Moderation logs and notes that name the user in rooms it does not own, and the user's activity on other people's resources, are kept (`user-account-deletion/specs/user/account-deletion/spec.md`, "The deletion states what it does not remove").
4. The shared character-pack files are kept, and have no owner to attribute them to (`user-account-deletion/specs/user/account-deletion/spec.md`, "The deletion states what it does not remove").
5. Azure AI Search keeps a copy of message text whose removal path is unverified (`user-account-deletion/design.md`, "Limits the spec states").

## Key files

| Path                                                               | Role                                                   |
| :----------------------------------------------------------------- | :----------------------------------------------------- |
| `packages/db-schema/src/schema/`                                   | The Postgres tables and their foreign keys             |
| `packages/db-schema/src/models/`                                   | `AzureTable` and `AzureContainer`, the stores in Azure |
| `packages/db/src/services/azure/container/`                        | The blob helpers, including the prefix delete          |
| `packages/db/src/services/resource/purgeResource.ts`               | The one existing whole-owner sweep, for resources      |
| `apps/web/server/services/room/deleteRoom.ts`                      | The room deletion an owner's departure runs            |
| `packages/db/src/services/message/softDeleteRoomMessagesByUser.ts` | The per-user soft delete inside one room               |
| `apps/functions/src/handlers/deleteAccountHandler.ts`              | The sweep that removes these stores, in order          |
