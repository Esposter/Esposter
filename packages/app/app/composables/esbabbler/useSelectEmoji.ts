import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { unemojify } from "node-emoji";

export const useSelectEmoji = async (message: MessageEntity) => {
  const { data: session } = await authClient.useSession(useFetch);
  const emojiStore = useEmojiStore();
  const { createEmoji, deleteEmoji, getEmojis, updateEmoji } = emojiStore;
  const emojis = computed(() => getEmojis(message.rowKey));
  return async (emoji: string) => {
    if (!session.value) return;

    const emojiTag = unemojify(emoji);
    const foundEmoji = emojis.value.find((e) => e.emojiTag === emojiTag);
    if (!foundEmoji) {
      await createEmoji({
        emojiTag,
        messageRowKey: message.rowKey,
        partitionKey: message.partitionKey,
      });
      return;
    }

    if (foundEmoji.userIds.includes(session.value.user.id)) {
      if (foundEmoji.userIds.length === 1)
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
          userIds: foundEmoji.userIds.filter((userId) => userId !== session.value?.user.id),
        });
      return;
    }

    await updateEmoji({
      messageRowKey: foundEmoji.messageRowKey,
      partitionKey: foundEmoji.partitionKey,
      rowKey: foundEmoji.rowKey,
      userIds: [...foundEmoji.userIds, session.value.user.id],
    });
  };
};
