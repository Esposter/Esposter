# User Data Inventory

Every place the platform keeps data that belongs to one account, with how each one is keyed to that account and what removes it today. Account deletion and data export both read this page: a store missing here is a store a deletion would leave behind and an export would omit. It describes the code as it stands; a change to a store updates its row here in the same change.

## Postgres

Every table with a foreign key to the user table, and what its key does when the user row is deleted.

| Table                                                                                                                                                                                                               | Keyed by                        | On user delete                                                                           |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------ | :--------------------------------------------------------------------------------------- |
| `accounts` (OAuth and credential tokens)                                                                                                                                                                            | `userId`                        | Blocked: the foreign key is `NO ACTION`. Deletion needs it cascaded.                     |
| `sessions`, `apiKeys`                                                                                                                                                                                               | `userId` (or `referenceId`)     | Cascade                                                                                  |
| `rooms` and its children (`usersToRooms`, `usersToRoomRoles`, `roomMemberPermissions`, `roomCategories`, `bans`, `invites`, `searchHistories`, `callSessions`, `scheduledMessageJobs`, `threadFollows`, `webhooks`) | `rooms.userId` is the owner     | Cascade. `bans.bannedByUserId` sets null. The rooms' messages and blobs are left behind. |
| `resources` and its children (`resourceVersions`, `resourceVersionAssets`, `resourceWorkingAssets`, `resourcePublications`, `resourceLinks`, `resourceAccesses`, `resourceFavorites`)                               | `resources.userId` is the owner | Cascade. The resources' blobs, table partitions and ledger rows are left behind.         |
| `posts`, `likes`, `friends`, `friendRequests`, `blocks`, `notifications`, `pushSubscriptions`, `bookmarks`, `userAchievements`, `userSettings`, `userStatuses`                                                      | `userId`                        | Cascade                                                                                  |
| `storageLedger`                                                                                                                                                                                                     | `userId`                        | Cascade, which drops the rows without releasing their bytes                              |

Rate limiting and verification rows also carry the user id, and both expire on their own.

## Azure Table

| Table                              | Partitioned by; user field             | Removed today                                                                                                                            |
| :--------------------------------- | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `Messages`                         | room id; `userId`, `mentions`, `files` | Soft delete only. The moderation ban sweep soft-deletes one user's messages in one room. A room's deletion does not clear its partition. |
| `MessagesMetadata` (reactions)     | room id; `userIds`                     | Removed when the reactor is the sole reactor                                                                                             |
| `ModerationLog`, `ModerationNotes` | room id; `actorUserId`, `targetUserId` | Not removed                                                                                                                              |
| `ResourceActivity`                 | resource id; `userId`, `apiKeyId`      | With the resource, by `purgeResource`. Activity by the user on other people's resources is not removed.                                  |
| `ProgramParticipants`              | resource id; a key value and a token   | With the resource, by `purgeResource`                                                                                                    |
| `SurveyResponses`                  | resource id; a participant token       | Per response, and with the resource by `purgeResource`                                                                                   |

## Blob containers

| Container                         | Path                                                                                        | Keyed by                                    | Removed today                                                             |
| :-------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------ | :------------------------------------------------------------------------ |
| `ResourceAssets`                  | `{resourceId}/…`                                                                            | The resource, charged to its owner          | With the resource, by `purgeResource`                                     |
| `MessageAssets`                   | `{roomId}/{fileId}`, its `.thumb`, `emoji/{id}`                                             | The room; a file is charged to its uploader | With its message's file, by the ban sweep, or by a room's prefix deletion |
| `PublicUserAssets`                | `{userId}/ProfileImage`, `rooms/{roomId}/ProfileImage*`                                     | The user or the room                        | A room's images with the room                                             |
| `PrivateUserAssets`               | `{userId}/CallBackground/{slot}`                                                            | The user                                    | One slot at a time                                                        |
| `GenshinAssets`                   | `{userId}/save.json`, `{userId}/character-packs.json`, `character-packs/staging/{userId}/…` | The user                                    | Staging is released after a keep. The saves are not removed.              |
| `ClickerAssets`, `DungeonsAssets` | `{userId}/save.json`                                                                        | The user                                    | Not removed. `DungeonsAssets` is publicly readable by URL.                |
| `GenshinAssets`                   | `character-packs/files/{sha256}`                                                            | Shared by content hash across accounts      | Never. There is no reference count.                                       |

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

1. `accounts` blocks the user row's deletion.
2. A user's rooms, resources and charged blobs outlive the user row, and a room's table partitions outlive the room.
3. Messages a user wrote in rooms they have since left are not reachable from the user, because membership is the only index.
4. The shared character-pack files have no owner to attribute them to.
5. Azure AI Search keeps a copy of message text whose removal path is unverified.

## Key files

| Path                                                                          | Role                                                   |
| :---------------------------------------------------------------------------- | :----------------------------------------------------- |
| `packages/db-schema/src/schema/`                                              | The Postgres tables and their foreign keys             |
| `packages/db-schema/src/models/`                                              | `AzureTable` and `AzureContainer`, the stores in Azure |
| `packages/db/src/services/azure/container/`                                   | The blob helpers, including the prefix delete          |
| `packages/db/src/services/resource/purgeResource.ts`                          | The one existing whole-owner sweep, for resources      |
| `apps/web/server/services/room/deleteRoom.ts`                                 | The room deletion an owner's departure runs            |
| `apps/web/server/services/message/moderation/softDeleteRoomMessagesByUser.ts` | The per-user soft delete inside one room               |
