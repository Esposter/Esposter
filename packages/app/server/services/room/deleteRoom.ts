import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { getRoomProfileImageBlobPrefix } from "@@/server/services/room/getRoomProfileImageBlobPrefix";
import { listBlobNames } from "@esposter/db";
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
  await publishBlobDeletion(id, AzureContainer.MessageAssets, async () => {
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    return listBlobNames(containerClient, id, { isDeep: true });
  });
  await publishBlobDeletion(id, AzureContainer.PublicUserAssets, async () => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    return listBlobNames(containerClient, getRoomProfileImageBlobPrefix(id), { isDeep: true });
  });
  roomEventEmitter.emit("deleteRoom", {
    roomId: deletedRoom.id,
    sessionId: session.id,
    userId: user.id,
  });
  return deletedRoom;
};
