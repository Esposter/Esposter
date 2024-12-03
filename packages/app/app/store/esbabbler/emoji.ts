import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

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
    createEmoji,
    deleteEmoji,
    getEmojiList,
    setEmojiList,
    updateEmoji,
  };
});
