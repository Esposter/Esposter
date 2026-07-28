import type { ContainerClient } from "@azure/storage-blob";
import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefixes } from "@@/server/services/room/getRoomProfileImageBlobPrefixes";
import { listBlobNames } from "@esposter/db";

interface ListRoomProfileImageBlobNamesOptions {
  createdBefore?: Date;
}

export const listRoomProfileImageBlobNames = async (
  containerClient: ContainerClient,
  roomId: RoomInMessage["id"],
  { createdBefore }: ListRoomProfileImageBlobNamesOptions = {},
): Promise<string[]> => {
  const blobNamesList = await Promise.all(
    getRoomProfileImageBlobPrefixes(roomId).map((prefix) => listBlobNames(containerClient, prefix, { createdBefore })),
  );
  return blobNamesList.flat();
};
