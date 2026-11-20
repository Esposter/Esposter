import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { ownedBy } from "#server/services/db/ownedBy";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "#server/services/queue/publishBlobPrefixDeletion";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getLiveInviteRowWhere } from "#server/services/room/getLiveInviteRowWhere";
import { listRoomProfileImageBlobNames } from "#server/services/room/listRoomProfileImageBlobNames";
import { getBucket } from "#server/services/storage/getBucket";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getRoomMemberIds } from "@esposter/db";
import {
  appUsersInMessage,
  bansInMessage,
  DatabaseEntityType,
  getLiveRoomEmojiWhere,
  getLiveRowWhere,
  getLiveWebhookWhere,
  invitesInMessage,
  roomEmojisInMessage,
  roomMemberPermissionsInMessage,
  roomRolesInMessage,
  roomsInMessage,
  StorageBucket,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  webhooksInMessage,
} from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { and, eq, inArray, isNull } from "drizzle-orm";

// A room's deletion is a tombstone, so every member's copy of the room leaves their list at the version the batch names.
// The membership a member held is tombstoned with it, and so are the room's roles, each member's role links and overrides,
// As a removal tombstones them, so no live child outlives its room. The room's invites, webhooks, the app users its webhooks
// Post as, its emoji and its bans are tombstoned in the same batch, so a link, a webhook or a ban of a deleted room refuses,
// And a client holding one drops it on the answer. The member's own tabs are told their membership's tombstone, and the
// Caller's row is the answer
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
    // A webhook's app user is named by the live webhook, so its statement runs first, while the webhook is still live,
    // In the order deleteWebhook keeps
    db
      .update(appUsersInMessage)
      .set({ deletedAt: new Date() })
      .where(
        inArray(
          appUsersInMessage.id,
          db
            .select({ userId: webhooksInMessage.userId })
            .from(webhooksInMessage)
            .where(and(eq(webhooksInMessage.roomId, id), getLiveWebhookWhere(webhooksInMessage))),
        ),
      ),
    db
      .update(webhooksInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(webhooksInMessage.roomId, id), getLiveWebhookWhere(webhooksInMessage))),
    db
      .update(invitesInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(invitesInMessage.roomId, id), getLiveInviteRowWhere(invitesInMessage))),
    db
      .update(roomEmojisInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(roomEmojisInMessage.roomId, id), getLiveRoomEmojiWhere(roomEmojisInMessage))),
    db
      .update(bansInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(bansInMessage.roomId, id), getLiveRowWhere(bansInMessage))),
    db
      .update(roomRolesInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(roomRolesInMessage.roomId, id), getLiveRowWhere(roomRolesInMessage))),
    db
      .update(usersToRoomRolesInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(usersToRoomRolesInMessage.roomId, id), getLiveRowWhere(usersToRoomRolesInMessage))),
    db
      .update(roomMemberPermissionsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(eq(roomMemberPermissionsInMessage.roomId, id), getLiveRowWhere(roomMemberPermissionsInMessage))),
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
