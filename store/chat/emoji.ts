import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import type { DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useRoomStore } from "@/store/chat/room";

export const useEmojiStore = defineStore("chat/emoji", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  // Record<partitionKey, Record<messageRowKey, MessageEmojiMetadataEntity[]>>
  const emojiMap = ref<Record<string, Record<string, MessageEmojiMetadataEntity[]>>>({});
  const getEmojiList = (messageRowKey: string) => {
    if (!currentRoomId || !emojiMap.value[currentRoomId]?.[messageRowKey]) return [];
    return emojiMap.value[currentRoomId][messageRowKey];
  };
  const setEmojiList = (messageRowKey: string, emojiList: MessageEmojiMetadataEntity[]) => {
    if (!currentRoomId) return;
    emojiMap.value[currentRoomId] = {
      ...emojiMap.value[currentRoomId],
      [messageRowKey]: emojiList,
    };
  };
  const pushEmojiMap = (messageRowKeys: string[], emojis: MessageEmojiMetadataEntity[]) => {
    for (const messageRowKey of messageRowKeys)
      setEmojiList(
        messageRowKey,
        emojis.filter((e) => e.messageRowKey === messageRowKey)
      );
  };

  const createEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojiList = getEmojiList(newEmoji.messageRowKey);
    emojiList.push(newEmoji);
  };
  const updateEmoji = (input: UpdateEmojiInput) => {
    const emojiList = getEmojiList(input.messageRowKey);
    const index = emojiList.findIndex((e) => e.partitionKey === input.partitionKey && e.rowKey === input.rowKey);
    if (index > -1)
      emojiList[index] = {
        ...emojiList[index],
        ...input,
        userIds: [...emojiList[index].userIds, ...input.userIds],
      };
  };
  const deleteEmoji = (input: DeleteEmojiInput) => {
    const emojiList = getEmojiList(input.messageRowKey);
    setEmojiList(
      input.messageRowKey,
      emojiList.filter((e) => !(e.partitionKey === input.partitionKey && e.rowKey === input.rowKey))
    );
  };

  return {
    getEmojiList,
    pushEmojiMap,
    createEmoji,
    updateEmoji,
    deleteEmoji,
  };
});
