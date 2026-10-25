import type { ContainerClient } from "@azure/storage-blob";
import type { ListBlobNamesOptions } from "@esposter/db";
import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { listBlobNames } from "@esposter/db";

export const listRoomProfileImageBlobNames = (
  containerClient: ContainerClient,
  roomId: RoomInMessage["id"],
  { createdBefore }: ListBlobNamesOptions = {},
): Promise<string[]> => listBlobNames(containerClient, getRoomProfileImageBlobPrefix(roomId), { createdBefore });
