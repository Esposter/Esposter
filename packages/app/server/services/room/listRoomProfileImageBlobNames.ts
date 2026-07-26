import type { ContainerClient } from "@azure/storage-blob";
import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefix } from "@@/server/services/room/getRoomProfileImageBlobPrefix";
import { listBlobNames } from "@esposter/db";

interface ListRoomProfileImageBlobNamesOptions {
  createdBefore?: Date;
}

// Uploads written before the per-upload prefix existed sit at the flat {roomId}/ProfileImage name instead, so
// Every sweep lists both to reach them — the flat name is never written any more, only collected.
export const listRoomProfileImageBlobNames = async (
  containerClient: ContainerClient,
  roomId: RoomInMessage["id"],
  { createdBefore }: ListRoomProfileImageBlobNamesOptions = {},
): Promise<string[]> => {
  const blobNamesList = await Promise.all(
    [getRoomProfileImageBlobPrefix(roomId), `${roomId}/ProfileImage`].map((prefix) =>
      listBlobNames(containerClient, prefix, { createdBefore, isDeep: true }),
    ),
  );
  return blobNamesList.flat();
};
