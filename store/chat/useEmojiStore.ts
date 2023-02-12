import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import type { CreateEmojiInput, DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

export const useEmojiStore = defineStore("chat/emoji", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  const messageStore = useMessageStore();
  const { messageList } = $(storeToRefs(messageStore));
  const { updateMessage } = messageStore;
  const getMessage = (partitionKey: string, rowKey: string) => {
    if (!messageList) return;
    const message = messageList.find((m) => m.partitionKey === partitionKey && m.rowKey === rowKey);
    return message;
  };

  const emojiMap = ref<Record<string, MessageEmojiMetadataEntity[]>>({});
  const emojiList = computed(() => {
    if (!currentRoomId || !emojiMap.value[currentRoomId]) return null;
    return emojiMap.value[currentRoomId];
  });
  const pushEmojiList = (emojis: MessageEmojiMetadataEntity[]) => {
    if (!currentRoomId || !emojiMap.value[currentRoomId]) return;
    emojiMap.value[currentRoomId].push(...emojis);
  };

  const initialiseEmojiList = (emojis: MessageEmojiMetadataEntity[]) => {
    if (!currentRoomId) return;
    emojiMap.value[currentRoomId] = emojis;
  };
  const createEmoji = (input: CreateEmojiInput & MessageEmojiMetadataEntity) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!currentRoomId || !emojiMap.value[currentRoomId]) return;

    const { emoji, messageRowKey, ...newEmoji } = input;
    emojiMap.value[currentRoomId].push(newEmoji);
    updateMessage({
      ...message,
      emojiMetadataTags: [...message.emojiMetadataTags, { rowKey: newEmoji.rowKey }],
    });
  };
  const updateEmoji = (input: UpdateEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!currentRoomId || !emojiMap.value[currentRoomId]) return;

    const { messageRowKey, ...updatedEmoji } = input;
    const emojis = emojiMap.value[currentRoomId];
    const index = emojis.findIndex((e) => e.partitionKey === input.partitionKey && e.rowKey === input.rowKey);
    if (index > -1)
      emojiMap.value[currentRoomId][index] = {
        ...emojis[index],
        ...updatedEmoji,
        userIds: [...emojis[index].userIds, ...updatedEmoji.userIds],
      };
  };
  const deleteEmoji = (input: DeleteEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;
    if (!currentRoomId || !emojiMap.value[currentRoomId]) return;

    const emojis = emojiMap.value[currentRoomId];
    emojiMap.value[currentRoomId] = emojis.filter(
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
