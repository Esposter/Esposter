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
  // Record<partitionKey, Record<messageRowKey, MessageEmojiMetadataEntity[]>>
  const emojiMap = ref<Record<string, Record<string, MessageEmojiMetadataEntity[]>>>({});
  const getEmojiList = computed(() => (messageRowKey: string) => {
    if (!currentRoomId || !emojiMap.value[currentRoomId][messageRowKey]) return [];
    return emojiMap.value[currentRoomId][messageRowKey];
  });
  const setEmojiList = (messageRowKey: string, emojiList: MessageEmojiMetadataEntity[]) => {
    if (!currentRoomId) return;
    // Initialise object if it doesn't exist
    if (!emojiMap.value[currentRoomId]) {
      emojiMap.value[currentRoomId] = {
        [messageRowKey]: emojiList,
      };
    } else {
      emojiMap.value[currentRoomId][messageRowKey] = emojiList;
    }
  };
  const pushEmojiList = (messageRowKey: string, emojis: MessageEmojiMetadataEntity[]) => {
    const emojiList = getEmojiList.value(messageRowKey);
    emojiList.push(...emojis);
  };

  const initialiseEmojiList = (messageRowKey: string, emojis: MessageEmojiMetadataEntity[]) => {
    setEmojiList(messageRowKey, emojis);
  };
  const createEmoji = (input: CreateEmojiInput & MessageEmojiMetadataEntity) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;

    const { emoji, messageRowKey, ...newEmoji } = input;
    const emojiList = getEmojiList.value(messageRowKey);
    emojiList.push(newEmoji);
    updateMessage({
      ...message,
      emojiMetadataTags: [...message.emojiMetadataTags, { rowKey: newEmoji.rowKey }],
    });
  };
  const updateEmoji = (input: UpdateEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;

    const { messageRowKey, ...updatedEmoji } = input;
    const emojiList = getEmojiList.value(messageRowKey);
    const index = emojiList.findIndex((e) => e.partitionKey === input.partitionKey && e.rowKey === input.rowKey);
    if (index > -1)
      emojiList[index] = {
        ...emojiList[index],
        ...updatedEmoji,
        userIds: [...emojiList[index].userIds, ...updatedEmoji.userIds],
      };
  };
  const deleteEmoji = (input: DeleteEmojiInput) => {
    const message = getMessage(input.partitionKey, input.rowKey);
    if (!message) return;

    const { messageRowKey } = input;
    const emojiList = getEmojiList.value(messageRowKey);
    setEmojiList(
      messageRowKey,
      emojiList.filter((e) => !(e.partitionKey === input.partitionKey && e.rowKey === input.rowKey))
    );
  };

  return {
    getEmojiList,
    pushEmojiList,
    initialiseEmojiList,
    createEmoji,
    updateEmoji,
    deleteEmoji,
  };
});
