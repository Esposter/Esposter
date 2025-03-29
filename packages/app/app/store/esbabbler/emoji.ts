import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

export const useEmojiStore = defineStore("esbabbler/emoji", () => {
  const { getMetadataList: getEmojiList, setMetadataList: setEmojiList } =
    useMessageMetadataMap<MessageEmojiMetadataEntity>();

  const storeCreateEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojiList = getEmojiList(newEmoji.messageRowKey);
    emojiList.push(newEmoji);
    setEmojiList(newEmoji.messageRowKey, emojiList);
  };
  const storeUpdateEmoji = (updatedEmoji: UpdateEmojiInput) => {
    const emojiList = getEmojiList(updatedEmoji.messageRowKey);
    const index = emojiList.findIndex(
      (e) => e.partitionKey === updatedEmoji.partitionKey && e.rowKey === updatedEmoji.rowKey,
    );
    if (index === -1) return;

    Object.assign(emojiList[index], {
      ...updatedEmoji,
      userIds: [...emojiList[index].userIds, ...updatedEmoji.userIds],
    });
    setEmojiList(updatedEmoji.messageRowKey, emojiList);
  };
  const storeDeleteEmoji = ({ messageRowKey, partitionKey, rowKey }: DeleteEmojiInput) => {
    const emojiList = getEmojiList(messageRowKey);
    setEmojiList(
      messageRowKey,
      emojiList.filter((e) => !(e.partitionKey === partitionKey && e.rowKey === rowKey)),
    );
  };

  return {
    getEmojiList,
    setEmojiList,
    storeCreateEmoji,
    storeDeleteEmoji,
    storeUpdateEmoji,
  };
});
