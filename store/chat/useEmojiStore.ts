import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import type { CreateEmojiInput, DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

export const useEmojiStore = defineStore("chat/emoji", () => {
  const roomStore = useRoomStore();
  const messageStore = useMessageStore();
  const getMessage = (partitionKey: string, rowKey: string) => {
    if (!messageStore.messageList) return;
    const message = messageStore.messageList.find((m) => m.partitionKey === partitionKey && m.rowKey === rowKey);
    return message;
  };

  const emojiMap = ref<Record<string, MessageEmojiMetadataEntity[]>>({});
  const emojiList = computed(() => {
    if (!roomStore.currentRoomId || !emojiMap.value[roomStore.currentRoomId]) return null;
    return emojiMap.value[roomStore.currentRoomId];
  });
  const pushEmojiList = (emojis: MessageEmojiMetadataEntity[]) => {
    if (!roomStore.currentRoomId || !emojiMap.value[roomStore.currentRoomId]) return;
    emojiMap.value[roomStore.currentRoomId].push(...emojis);
  };

  const initialiseEmojiList = (emojis: MessageEmojiMetadataEntity[]) => {
    if (!roomStore.currentRoomId) return;
    emojiMap.value[roomStore.currentRoomId] = emojis;
  };
  const createEmoji = (input: CreateEmojiInput & MessageEmojiMetadataEntity) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!roomStore.currentRoomId || !emojiMap.value[roomStore.currentRoomId]) return;

    const { emoji, messageRowKey, ...newEmoji } = input;
    emojiMap.value[roomStore.currentRoomId].push(newEmoji);
    messageStore.updateMessage({
      ...message,
      emojiMetadataTags: [...message.emojiMetadataTags, { rowKey: newEmoji.rowKey }],
    });
  };
  const updateEmoji = (input: UpdateEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!roomStore.currentRoomId || !emojiMap.value[roomStore.currentRoomId]) return;

    const { messageRowKey, ...updatedEmoji } = input;
    const emojis = emojiMap.value[roomStore.currentRoomId];
    const index = emojis.findIndex((e) => e.partitionKey === input.partitionKey && e.rowKey === input.rowKey);
    if (index > -1)
      emojiMap.value[roomStore.currentRoomId][index] = {
        ...emojis[index],
        ...updatedEmoji,
        userIds: [...emojis[index].userIds, ...updatedEmoji.userIds],
      };
  };
  const deleteEmoji = (input: DeleteEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!roomStore.currentRoomId || !emojiMap.value[roomStore.currentRoomId]) return;

    const emojis = emojiMap.value[roomStore.currentRoomId];
    emojiMap.value[roomStore.currentRoomId] = emojis.filter(
      (e) => !(e.partitionKey === input.partitionKey && e.rowKey === input.rowKey)
    );
  };

  return {
    emojiList,
    pushEmojiList,
    initialiseEmojiList,
    createEmoji,
    updateEmoji,
    deleteEmoji,
  };
});
