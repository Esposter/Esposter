import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { getPublicAssetUrl } from "#server/services/storage/getPublicAssetUrl";
import { StorageBucket } from "@esposter/db-schema";

// The blob a room image url names when the url is one of this room's own uploads. Any other url, an admin's typed link
// Included, names no blob this room's prefix holds, so it is undefined
export const getRoomProfileImageBlobNameFromUrl = (roomId: RoomInMessage["id"], image: string): string | undefined => {
  const blobPrefix = `${getRoomProfileImageBlobPrefix(roomId)}/`;
  const blobPrefixUrl = getPublicAssetUrl(StorageBucket.PublicUserAssets, blobPrefix);
  return image.startsWith(blobPrefixUrl) ? `${blobPrefix}${image.slice(blobPrefixUrl.length)}` : undefined;
};
