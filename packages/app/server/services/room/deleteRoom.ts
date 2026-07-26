import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "@@/server/services/azure/eventGrid/publishBlobPrefixDeletion";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { listRoomProfileImageBlobNames } from "@@/server/services/room/listRoomProfileImageBlobNames";
import { AzureContainer, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const deleteRoom = async (db: Context["db"], { session, user }: GetSessionPayload, id: string) => {
  const deletedRoom = (
    await db
      .delete(roomsInMessage)
      .where(ownedBy(roomsInMessage, id, user.id))
      .returning()
  )[0];
  if (!deletedRoom)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id).message,
    });

  // A dropped listing or publish leaves orphaned room assets, never the deletion that already landed
  await Promise.all([
    // A room's attachments have no ceiling, so the prefix goes to the handler rather than being walked here —
    // Enumerating a long-lived room's blobs inline would hold the owner's delete open until it timed out
    publishBlobPrefixDeletion(id, AzureContainer.MessageAssets, id),
    // Profile images are a handful, and their listing has to reach a pre-cutover flat name the prefix walk
    // Would not cover, so this one stays a resolved list
    publishBlobDeletion(id, AzureContainer.PublicUserAssets, async () => {
      const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
      return listRoomProfileImageBlobNames(containerClient, id);
    }),
  ]);
  roomEventEmitter.emit("deleteRoom", {
    roomId: deletedRoom.id,
    sessionId: session.id,
    userId: user.id,
  });
  return deletedRoom;
};
