import type { MessageEntity } from "@esposter/db-schema";

import { useEmojiStore } from "@/store/message/emoji";

export const useSelectEmoji = (message: MessageEntity) => {
  const emojiStore = useEmojiStore();
  const { createEmoji, getEmojis, toggleEmoji } = emojiStore;
  return async (emoji: string) => {
    // A reaction is stored as the emoji itself — toned exactly as it was picked — so its identity is plain
    // String equality and needs no index, no shortcode vocabulary and no parsing. 👍 and 👍🏽 are different
    // Strings and therefore different reactions, which is what Discord and Slack both do
    const foundEmoji = getEmojis(message.rowKey).find(({ emojiTag }) => emojiTag === emoji);
    if (foundEmoji) await toggleEmoji(foundEmoji);
    else
      await createEmoji({
        emojiTag: emoji,
        messageRowKey: message.rowKey,
        partitionKey: message.partitionKey,
      });
  };
};
