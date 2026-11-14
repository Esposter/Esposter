import type { R2Bucket } from "@cloudflare/workers-types";
import type { ListBlobNamesOptions } from "@esposter/db";
import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { listBlobNames } from "@esposter/db";

export const listRoomProfileImageBlobNames = (
  bucket: R2Bucket,
  roomId: RoomInMessage["id"],
  { createdBefore }: ListBlobNamesOptions = {},
): Promise<string[]> => listBlobNames(bucket, getRoomProfileImageBlobPrefix(roomId), { createdBefore });
