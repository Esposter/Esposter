import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";

import { useEmojiStore } from "#src/store/message/emoji";

export const useReadEmojis = () => {
  const { $trpc } = useNuxtApp();
  const emojiStore = useEmojiStore();
  const { storeEmoji } = emojiStore;
  return async (roomId: RoomInMessage["id"], messageIds: ClientMessage["id"][]) => {
    if (messageIds.length === 0) return [];

    const emojis = await $trpc.message.emoji.readReactions.query({ messageIds, roomId });
    // Each row arrives by its version, so a read that answered before a removal cannot put the reaction back
    for (const emoji of emojis) storeEmoji(roomId, emoji);
    return emojis;
  };
};
