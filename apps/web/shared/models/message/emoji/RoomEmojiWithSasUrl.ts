import type { RoomEmojiInMessage } from "@esposter/db-schema";

// A room emoji as every surface renders it: the row plus a read SAS for the blob its id names. The url is
// Bundled into the read rather than signed per render — the set is capped, so signing it once with the listing
// Costs one pass and leaves nothing to re-sign while the room is open
export interface RoomEmojiWithSasUrl extends RoomEmojiInMessage {
  sasUrl: string;
}
