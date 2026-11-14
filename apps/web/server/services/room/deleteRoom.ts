import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { ownedBy } from "#server/services/db/ownedBy";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "#server/services/queue/publishBlobPrefixDeletion";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { getBucket } from "#server/services/storage/getBucket";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { DatabaseEntityType, roomsInMessage, StorageBucket } from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";

export const deleteRoom = async (db: Context["db"], { user }: GetSessionPayload, id: string) => {
  const deletedRooms = await db
    .delete(roomsInMessage)
    .where(ownedBy(roomsInMessage, id, user.id))
    .returning();
  const deletedRoom = requireMutation(deletedRooms[0], Operation.Delete, DatabaseEntityType.Room, id);

  // The members the room has online are told before its object is emptied, since emptying it forgets who they are. The
  // Object then closes every socket still open on the room
  await notifyOnlineRoomMembers(id, { data: { roomId: id, userId: user.id }, type: "deleteRoom" });
  await getResultAsync(() => useRoomObject(id).deleteAll()).match(noop, (error) => {
    console.error("A deleted room's object failed to close its sockets", { error, roomId: id });
  });
  // A dropped listing or publish leaves orphaned room assets, never the deletion that already landed — which is
  // Also why both run after the notification (openspec/specs/architecture/persist-then-notify/design.md): the room is
  // Gone the moment the row is, so making every member's UI wait on a blob listing and two queue publishes buys them
  // Nothing.
  await Promise.all([
    // A room's attachments have no ceiling, so the prefix goes to the handler rather than being walked here —
    // Enumerating a long-lived room's blobs inline would hold the owner's delete open until it timed out.
    // Unbounded in time, unlike every other prefix sweep: the room row is gone, so nothing can re-own this
    // Prefix and this is its only teardown — a `createdBefore` cutoff would permanently strand the attachment
    // Of any member still holding a write SAS when the owner deleted, billed and downloadable forever
    publishBlobPrefixDeletion(StorageBucket.MessageAssets, id, undefined).match(noop, console.error),
    // Profile images are a handful, so their listing stays a resolved list rather than a prefix walk
    publishBlobDeletion(StorageBucket.PublicUserAssets, async () => {
      const bucket = getBucket(StorageBucket.PublicUserAssets);
      return listRoomProfileImageBlobNames(bucket, id);
    }).match(noop, console.error),
  ]);
  return deletedRoom;
};
