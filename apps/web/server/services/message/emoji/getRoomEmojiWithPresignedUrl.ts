import type { RoomEmojiInMessage, RoomEmojiWithPresignedUrl, StorageBucket } from "@esposter/db-schema";

import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { createPresignedGetUrl } from "@esposter/db";
import { getRoomEmojiBlobName } from "@esposter/db-schema";

// Every surface renders an emoji from its row plus a presigned read url for the blob the row's id names, so the two
// Travel together everywhere a row leaves the router
export const getRoomEmojiWithPresignedUrl = async (
  bucketName: StorageBucket,
  roomEmoji: RoomEmojiInMessage,
): Promise<RoomEmojiWithPresignedUrl> => ({
  ...roomEmoji,
  presignedUrl: await createPresignedGetUrl(
    getStorageCredentials(),
    bucketName,
    getRoomEmojiBlobName(roomEmoji.roomId, roomEmoji.id),
  ),
});
