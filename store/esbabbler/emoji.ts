import type { MessageEmojiMetadataEntity } from "@/models/esbabbler/message/emoji";
import type { DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useRoomStore } from "@/store/esbabbler/room";

export const useEmojiStore = defineStore("esbabbler/emoji", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  // Record<partitionKey, Record<messageRowKey, MessageEmojiMetadataEntity[]>>
  const emojiMap = ref<Record<string, Record<string, MessageEmojiMetadataEntity[]>>>({});
  const getEmojiList = (messageRowKey: string) => {
    if (!currentRoomId.value || !emojiMap.value[currentRoomId.value]?.[messageRowKey]) return [];
    return emojiMap.value[currentRoomId.value][messageRowKey];
  };
  const setEmojiList = (messageRowKey: string, emojiList: MessageEmojiMetadataEntity[]) => {
    if (!currentRoomId.value) return;
    emojiMap.value[currentRoomId.value] = {
      ...emojiMap.value[currentRoomId.value],
      [messageRowKey]: emojiList,
    };
  };
  const pushEmojiMap = (messageRowKeys: string[], emojis: MessageEmojiMetadataEntity[]) => {
    for (const messageRowKey of messageRowKeys)
      setEmojiList(
        messageRowKey,
        emojis.filter((e) => e.messageRowKey === messageRowKey),
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
      emojiList.filter((e) => !(e.partitionKey === input.partitionKey && e.rowKey === input.rowKey)),
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
