import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { unemojify } from "node-emoji";

export const useSelectEmoji = async (message: MessageEntity) => {
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const emojiStore = useEmojiStore();
  const { getEmojiList } = emojiStore;
  const emojis = computed(() => getEmojiList(message.rowKey));
  return async (emoji: string) => {
    if (!session.value) return;

    const emojiTag = unemojify(emoji);
    const foundEmoji = emojis.value.find((e) => e.emojiTag === emojiTag);
    if (!foundEmoji) {
      await $trpc.emoji.createEmoji.mutate({
        emojiTag,
        messageRowKey: message.rowKey,
        partitionKey: message.partitionKey,
      });
      return;
    }

    if (foundEmoji.userIds.includes(session.value.user.id)) {
      if (foundEmoji.userIds.length === 1)
        await $trpc.emoji.deleteEmoji.mutate({
          messageRowKey: foundEmoji.messageRowKey,
          partitionKey: foundEmoji.partitionKey,
          rowKey: foundEmoji.rowKey,
        });
      else
        await $trpc.emoji.updateEmoji.mutate({
          messageRowKey: foundEmoji.messageRowKey,
          partitionKey: foundEmoji.partitionKey,
          rowKey: foundEmoji.rowKey,
          userIds: foundEmoji.userIds.filter((userId) => userId !== session.value?.user.id),
        });
      return;
    }

    await $trpc.emoji.updateEmoji.mutate({
      messageRowKey: foundEmoji.messageRowKey,
      partitionKey: foundEmoji.partitionKey,
      rowKey: foundEmoji.rowKey,
      userIds: [...foundEmoji.userIds, session.value.user.id],
    });
  };
};
