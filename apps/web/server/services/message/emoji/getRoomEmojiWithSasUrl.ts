import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { ContainerClient } from "@azure/storage-blob";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { getRoomEmojiBlobName } from "@@/server/services/message/emoji/getRoomEmojiBlobName";
import { generateReadSasUrl } from "@esposter/db";
// Every surface renders an emoji from its row plus a read SAS for the blob the row's id names, so the two
// Travel together everywhere a row leaves the router
export const getRoomEmojiWithSasUrl = async (
  containerClient: ContainerClient,
  roomEmoji: RoomEmojiInMessage,
): Promise<RoomEmojiWithSasUrl> => ({
  ...roomEmoji,
  sasUrl: await generateReadSasUrl(
    containerClient.getBlockBlobClient(getRoomEmojiBlobName(roomEmoji.roomId, roomEmoji.id)),
  ),
});
