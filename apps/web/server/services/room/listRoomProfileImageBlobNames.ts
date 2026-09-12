import type { ContainerClient } from "@azure/storage-blob";
import type { ListBlobNamesOptions } from "@esposter/db";
import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefixes } from "@@/server/services/room/getRoomProfileImageBlobPrefixes";
import { listBlobNames } from "@esposter/db";

export const listRoomProfileImageBlobNames = async (
  containerClient: ContainerClient,
  roomId: RoomInMessage["id"],
  { createdBefore }: ListBlobNamesOptions = {},
): Promise<string[]> => {
  const blobNamesList = await Promise.all(
    getRoomProfileImageBlobPrefixes(roomId).map((prefix) => listBlobNames(containerClient, prefix, { createdBefore })),
  );
  return blobNamesList.flat();
};
