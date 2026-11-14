import type { RoomEmojiInMessage } from "#src/schema/message/roomEmojisInMessage";
import { selectRoomEmojiInMessageSchema } from "#src/schema/message/roomEmojisInMessage";
import { URL_MAX_LENGTH } from "#src/services/shared/constants";
import { z } from "zod";

// A room emoji as every surface renders it: the row plus a read SAS for the blob its id names. The url is
// Bundled into the read rather than signed per render — the set is capped, so signing it once with the listing
// Costs one pass and leaves nothing to re-sign while the room is open
export interface RoomEmojiWithSasUrl extends RoomEmojiInMessage {
  sasUrl: string;
}

export const roomEmojiWithSasUrlSchema = z.object({
  ...selectRoomEmojiInMessageSchema.shape,
  sasUrl: z.url().max(URL_MAX_LENGTH),
}) satisfies z.ZodType<RoomEmojiWithSasUrl>;
