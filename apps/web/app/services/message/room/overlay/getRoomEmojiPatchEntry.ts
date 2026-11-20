import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { roomEmojiTable } from "#src/services/message/room/overlay/constants";

// An entry that sets the named fields of an emoji the overlay holds. An emoji it does not hold is left as it is, so the
// Write it belongs to changes nothing on screen
export const getRoomEmojiPatchEntry =
  (id: RoomEmojiInMessage["id"], patch: Partial<RoomEmojiInMessage>): Entry =>
  (view) => {
    const roomEmoji = view.get(roomEmojiTable, [id]);
    if (roomEmoji) view.set(roomEmojiTable, [id], { ...roomEmoji, ...patch });
  };
