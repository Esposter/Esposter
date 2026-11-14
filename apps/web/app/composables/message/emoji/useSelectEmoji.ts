import type { ClientMessage } from "@/models/message/ClientMessage";

import { useEmojiStore } from "@/store/message/emoji";

export const useSelectEmoji = (message: ClientMessage) => {
  const emojiStore = useEmojiStore();
  const { createEmoji, getEmojis, toggleEmoji } = emojiStore;
  return async (emoji: string) => {
    // A reaction is stored as the emoji itself — toned exactly as it was picked — so its identity is plain
    // String equality and needs no index, no shortcode vocabulary and no parsing. 👍 and 👍🏽 are different
    // Strings and therefore different reactions, which is what Discord and Slack both do
    const foundEmoji = getEmojis(message.roomId, message.id).find(({ emojiTag }) => emojiTag === emoji);
    if (foundEmoji) await toggleEmoji(message.roomId, foundEmoji);
    else await createEmoji({ emojiTag: emoji, messageId: message.id, roomId: message.roomId });
  };
};
