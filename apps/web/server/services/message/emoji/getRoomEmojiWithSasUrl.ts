import type { RoomEmojiInMessage, RoomEmojiWithSasUrl, StorageBucket } from "@esposter/db-schema";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { createPresignedGetUrl } from "@esposter/db";
import { getRoomEmojiBlobName } from "@esposter/db-schema";

// Every surface renders an emoji from its row plus a read SAS for the blob the row's id names, so the two
// Travel together everywhere a row leaves the router
export const getRoomEmojiWithSasUrl = async (
  bucketName: StorageBucket,
  roomEmoji: RoomEmojiInMessage,
): Promise<RoomEmojiWithSasUrl> => ({
  ...roomEmoji,
  sasUrl: await createPresignedGetUrl(
    getStorageCredentials(),
    bucketName,
    getRoomEmojiBlobName(roomEmoji.roomId, roomEmoji.id),
  ),
});
