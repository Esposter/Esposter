import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { ownedBy } from "#server/services/db/ownedBy";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "#server/services/queue/publishBlobPrefixDeletion";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { getBucket } from "#server/services/storage/getBucket";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getRoomMemberIds } from "@esposter/db";
import {
  DatabaseEntityType,
  invitesInMessage,
  roomsInMessage,
  StorageBucket,
  usersToRoomsInMessage,
  webhooksInMessage,
} from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

// A room's deletion is a tombstone, so every member's copy of the room leaves their list at the version the batch names.
// The membership a member held is tombstoned with it. The invites and webhooks of the room are removed with it, so a link
// Or a webhook of a deleted room refuses, as the hard delete's cascade left them. The member's own tabs are told their
// Membership's tombstone, and the caller's row is the answer
export const deleteRoom = async (
  { db, user }: Pick<AuthedContext, "db" | "user">,
  id: string,
): Promise<UserToRoomInMessage> => {
  const ownedRooms = await db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(and(ownedBy(roomsInMessage, id, user.id), isNull(roomsInMessage.deletedAt)));
  requireMutation(ownedRooms[0], Operation.Delete, DatabaseEntityType.Room, id);

  // The object is emptied before the row is tombstoned, and so is each member's object of what it holds for the room. A
  // Sender's or a member's index that refuses its removal fails the delete with the row still standing, so the owner's retry
  // Finds the room and empties it again, rather than leaving its messages in the object
  await useRoomObject(id).deleteAll(await getRoomMemberIds(db, id));
  const [deletedRoomRows, removedMemberships] = await db.batch([
    db
      .update(roomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(ownedBy(roomsInMessage, id, user.id), isNull(roomsInMessage.deletedAt)))
      .returning(),
    db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(usersToRoomsInMessage.roomId, id), isNull(usersToRoomsInMessage.deletedAt)))
      .returning(),
    db.delete(invitesInMessage).where(eq(invitesInMessage.roomId, id)),
    db.delete(webhooksInMessage).where(eq(webhooksInMessage.roomId, id)),
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
