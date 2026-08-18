import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/message/emoji";

export const useSelectEmoji = async (message: MessageEntity) => {
  const { data: session } = await authClient.useSession(useFetch);
  const emojiStore = useEmojiStore();
  const { createEmoji, deleteEmoji, getEmojis, updateEmoji } = emojiStore;
  return async (emoji: string) => {
    if (!session.value) return;

    // A reaction is stored as the emoji itself — toned exactly as it was picked — so its identity is plain
    // String equality and needs no index, no shortcode vocabulary and no parsing. 👍 and 👍🏽 are different
    // Strings and therefore different reactions, which is what Discord and Slack both do
    const foundEmoji = getEmojis(message.rowKey).find(({ emojiTag }) => emojiTag === emoji);
    if (!foundEmoji)
      await createEmoji({
        emojiTag: emoji,
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
