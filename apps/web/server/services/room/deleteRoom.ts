import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { ownedBy } from "#server/services/db/ownedBy";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "#server/services/queue/publishBlobPrefixDeletion";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { getBucket } from "#server/services/storage/getBucket";
import { getCascadeTombstones } from "#server/services/tombstone/getCascadeTombstones";
import { getWebhookAppUserTombstone } from "#server/services/tombstone/getWebhookAppUserTombstone";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getRoomMemberIds } from "@esposter/db";
import {
  DatabaseEntityType,
  getLiveRowWhere,
  roomsInMessage,
  StorageBucket,
  usersToRoomsInMessage,
  webhooksInMessage,
} from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// A room's deletion is a tombstone, so every member's copy of the room leaves their list at the version the batch names.
// The membership a member held is tombstoned with it, and so is every child the room's cascade would remove: its roles,
// Each member's role links and overrides, its invites, webhooks, the app users its webhooks post as, its emoji and its
// Bans, so no live child outlives its room and a link, a webhook or a ban of a deleted room refuses. A client holding one
// Drops it on the answer. The member's own tabs are told their membership's tombstone, and the caller's row is the answer
export const deleteRoom = async (
  { db, user }: Pick<AuthedContext, "db" | "user">,
  id: string,
): Promise<UserToRoomInMessage> => {
  const ownedRooms = await db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(and(ownedBy(roomsInMessage, id, user.id), getLiveRowWhere(roomsInMessage)));
  requireMutation(ownedRooms[0], Operation.Delete, DatabaseEntityType.Room, id);
  // The object is emptied before the row is tombstoned, and so is each member's object of what it holds for the room. A
  // Sender's or a member's index that refuses its removal fails the delete with the row still standing, so the owner's retry
  // Finds the room and empties it again, rather than leaving its messages in the object
  await useRoomObject(id).deleteAll(await getRoomMemberIds(db, id));
  const [deletedRoomRows, removedMemberships] = await db.batch([
    db
      .update(roomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(ownedBy(roomsInMessage, id, user.id), getLiveRowWhere(roomsInMessage)))
      .returning(),
    // The membership is batched here, since its rows are the answer, and the room's other children follow it by the cascade
    db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(usersToRoomsInMessage.roomId, id), getLiveRowWhere(usersToRoomsInMessage)))
      .returning(),
    // A webhook's app user is not the room's cascade's to reach: the foreign key runs from the webhook to its app user, so the
    // Cascade walks down to the webhook and never up to the app user. The live webhooks name them, so this runs first, while the
    // Webhook is still live, in the order deleteWebhook keeps
    getWebhookAppUserTombstone(db, eq(webhooksInMessage.roomId, id)),
    ...getCascadeTombstones(db, roomsInMessage, eq(roomsInMessage.id, id), [usersToRoomsInMessage]),
  ] as const);
  requireMutation(deletedRoomRows[0], Operation.Delete, DatabaseEntityType.Room, id);
  await Promise.all(
    removedMemberships.map((membership: UserToRoomInMessage) =>
      callUserObjects([membership.userId], (userObject) => userObject.updateUserToRoom(membership)),
    ),
  );
  const callerMembership = removedMemberships.find(({ userId }: UserToRoomInMessage) => userId === user.id);
  const removedMembership = requireMutation(callerMembership, Operation.Delete, DatabaseEntityType.UserToRoom, id);
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
  return removedMembership;
};
