import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "@@/server/services/azure/eventGrid/publishBlobPrefixDeletion";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { listRoomProfileImageBlobNames } from "@@/server/services/room/listRoomProfileImageBlobNames";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { AzureContainer, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const deleteRoom = async (db: Context["db"], { session, user }: GetSessionPayload, id: string) => {
  const deletedRoom = (
    await db
      .delete(roomsInMessage)
      .where(ownedBy(roomsInMessage, id, user.id))
      .returning()
  )[0];
  if (!deletedRoom) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id);

  roomEventEmitter.emit("deleteRoom", {
    roomId: deletedRoom.id,
    sessionId: session.id,
    userId: user.id,
  });
  // A dropped listing or publish leaves orphaned room assets, never the deletion that already landed — which is
  // Also why both run after the broadcast (/docs/architecture/persist-then-notify): the room is gone the moment
  // The row is, so making every member's UI wait on a blob listing and two Event Grid POSTs buys them nothing.
  await Promise.all([
    // A room's attachments have no ceiling, so the prefix goes to the handler rather than being walked here —
    // Enumerating a long-lived room's blobs inline would hold the owner's delete open until it timed out.
    // Unbounded in time, unlike every other prefix sweep: the room row is gone, so nothing can re-own this
    // Prefix and this is its only teardown — a `createdBefore` cutoff would permanently strand the attachment
    // Of any member still holding a write SAS when the owner deleted, billed and downloadable forever
    publishBlobPrefixDeletion(id, AzureContainer.MessageAssets, id, undefined),
    // Profile images are a handful, and their listing has to reach a pre-cutover flat name the prefix walk
    // Would not cover, so this one stays a resolved list
    publishBlobDeletion(id, AzureContainer.PublicUserAssets, async () => {
      const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
      return listRoomProfileImageBlobNames(containerClient, id);
    }),
  ]);
  return deletedRoom;
};
