import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { ownedBy } from "#server/services/db/ownedBy";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "#server/services/queue/publishBlobPrefixDeletion";
import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { getBucket } from "#server/services/storage/getBucket";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { DatabaseEntityType, getTopic, roomsInMessage, StorageBucket, TopicKind } from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";

export const deleteRoom = async ({ db, user }: Pick<AuthedContext, "db" | "user">, id: string) => {
  const ownedRooms = await db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(ownedBy(roomsInMessage, id, user.id));
  requireMutation(ownedRooms[0], Operation.Delete, DatabaseEntityType.Room, id);

  // The object is emptied before the row goes. A sender's index that refuses its removal fails the delete with the row
  // Still standing, so the owner's retry finds the room and empties it again, rather than leaving its messages in the object
  const scheduledMessageSenderIds = await useRoomObject(id).deleteAll({ userId: user.id });
  // The scheduled messages it removed were other people's, so each sender's list is told as soon as they are gone, before
  // The row goes: a failure after this still leaves them told
  await publishTopicsBestEffort(
    () => scheduledMessageSenderIds.map((senderId) => ({ topic: getTopic(TopicKind.ScheduledMessage, senderId) })),
    "Failed to publish the topic of a scheduled message removed with its room:",
  );
  const deletedRooms = await db
    .delete(roomsInMessage)
    .where(ownedBy(roomsInMessage, id, user.id))
    .returning();
  const deletedRoom = requireMutation(deletedRooms[0], Operation.Delete, DatabaseEntityType.Room, id);

  // A dropped listing or publish leaves orphaned room assets, never the deletion that already landed. So both run after
  // The row is gone, where a member's UI does not wait on a blob listing and two queue publishes
  await Promise.all([
    // A room's attachments have no ceiling, so the prefix goes to the handler rather than being walked here —
    // Enumerating a long-lived room's blobs inline would hold the owner's delete open until it timed out.
    // Unbounded in time, unlike every other prefix sweep: the room row is gone, so nothing can re-own this
    // Prefix and this is its only teardown — a `createdBefore` cutoff would permanently strand the attachment
    // Of any member still holding a presigned write url when the owner deleted, billed and downloadable forever
    publishBlobPrefixDeletion(StorageBucket.MessageAssets, id, undefined).match(noop, console.error),
    // Profile images are a handful, so their listing stays a resolved list rather than a prefix walk
    publishBlobDeletion(StorageBucket.PublicUserAssets, async () => {
      const bucket = getBucket(StorageBucket.PublicUserAssets);
      return listRoomProfileImageBlobNames(bucket, id);
    }).match(noop, console.error),
  ]);
  return deletedRoom;
};
