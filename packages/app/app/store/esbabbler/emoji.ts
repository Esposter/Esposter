import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";

export const useEmojiStore = defineStore("esbabbler/emoji", () => {
  const { getEmojis, setEmojis } = useMessageMetadataMap(MessageMetadataType.Emoji);

  const storeCreateEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojis = getEmojis(newEmoji.messageRowKey);
    emojis.push(newEmoji);
    setEmojis(newEmoji.messageRowKey, emojis);
  };
  const storeUpdateEmoji = (updatedEmoji: UpdateEmojiInput) => {
    const emojis = getEmojis(updatedEmoji.messageRowKey);
    const index = emojis.findIndex(
      ({ partitionKey, rowKey }) => partitionKey === updatedEmoji.partitionKey && rowKey === updatedEmoji.rowKey,
    );
    if (index === -1) return;

    Object.assign(emojis[index], updatedEmoji, {
      userIds: [...emojis[index].userIds, ...updatedEmoji.userIds],
    });
    setEmojis(updatedEmoji.messageRowKey, emojis);
  };
  const storeDeleteEmoji = ({ messageRowKey, partitionKey, rowKey }: DeleteEmojiInput) => {
    const emojis = getEmojis(messageRowKey);
    setEmojis(
      messageRowKey,
      emojis.filter((e) => !(e.partitionKey === partitionKey && e.rowKey === rowKey)),
    );
  };

  return {
    getEmojis,
    setEmojis,
    storeCreateEmoji,
    storeDeleteEmoji,
    storeUpdateEmoji,
  };
});
