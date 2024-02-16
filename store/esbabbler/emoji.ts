import { type MessageEmojiMetadataEntity } from "@/models/esbabbler/message/emoji";
import {
  type CreateEmojiInput,
  type DeleteEmojiInput,
  type UpdateEmojiInput,
} from "@/server/trpc/routers/message/emoji";

export const useEmojiStore = defineStore("esbabbler/emoji", () => {
  const { $client } = useNuxtApp();
  const { getMetadataList: getEmojiList, setMetadataList: setEmojiList } =
    useMessageMetadataMap<MessageEmojiMetadataEntity>();
  const createEmoji = async (input: CreateEmojiInput) => {
    const newEmoji = await $client.emoji.createEmoji.mutate(input);
    if (!newEmoji) return;

    const emojiList = getEmojiList(newEmoji.messageRowKey);
    emojiList.push(newEmoji);
  };
  const updateEmoji = async (input: UpdateEmojiInput) => {
    const updatedEmoji = await $client.emoji.updateEmoji.mutate(input);
    if (!updatedEmoji) return;

    const emojiList = getEmojiList(updatedEmoji.messageRowKey);
    const index = emojiList.findIndex(
      (e) => e.partitionKey === updatedEmoji.partitionKey && e.rowKey === updatedEmoji.rowKey,
    );
    if (index > -1)
      emojiList[index] = {
        ...emojiList[index],
        ...updatedEmoji,
        userIds: [...emojiList[index].userIds, ...updatedEmoji.userIds],
      };
  };
  const deleteEmoji = async (input: DeleteEmojiInput) => {
    await $client.emoji.deleteEmoji.mutate(input);
    const emojiList = getEmojiList(input.messageRowKey);
    setEmojiList(
      input.messageRowKey,
      emojiList.filter((e) => !(e.partitionKey === input.partitionKey && e.rowKey === input.rowKey)),
    );
  };

  return {
    getEmojiList,
    setEmojiList,
    createEmoji,
    updateEmoji,
    deleteEmoji,
  };
});
