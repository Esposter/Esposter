import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { getEmojiSlug } from "@/services/message/emoji/getEmojiSlug";
import { useEmojiStore } from "@/store/message/emoji";

export const useSelectEmoji = async (message: MessageEntity) => {
  const { data: session } = await authClient.useSession(useFetch);
  const emojiStore = useEmojiStore();
  const { createEmoji, deleteEmoji, getEmojis, updateEmoji } = emojiStore;
  return async (emoji: string) => {
    if (!session.value) return;

    const emojiTag = getEmojiSlug(emoji);
    // Both sides go through the slug rather than comparing the stored strings, so a row written as a raw
    // Glyph and one written as its shortcode are the same reaction and toggle rather than duplicating
    const foundEmoji = getEmojis(message.rowKey).find((storedEmoji) => getEmojiSlug(storedEmoji.emojiTag) === emojiTag);
    if (!foundEmoji)
      await createEmoji({
        emojiTag,
        messageRowKey: message.rowKey,
        partitionKey: message.partitionKey,
      });
    else if (foundEmoji.userIds.includes(session.value.user.id) && foundEmoji.userIds.length === 1)
      await deleteEmoji({
        messageRowKey: foundEmoji.messageRowKey,
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
      });
    else
      await updateEmoji({
        messageRowKey: foundEmoji.messageRowKey,
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
        userIds: foundEmoji.userIds,
      });
  };
};
