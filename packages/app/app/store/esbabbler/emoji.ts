import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { createMessageEmojiMetadataEntity } from "#shared/services/esbabbler/createMessageEmojiMetadataEntity";
import { authClient } from "@/services/auth/authClient";

export const useEmojiStore = defineStore("esbabbler/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { getEmojis, setEmojis } = useMessageMetadataMap(MessageMetadataType.Emoji);
  // Optimistically update UI
  const createEmoji = async (input: CreateEmojiInput) => {
    if (!session.value.data) return;
    const newEmoji = reactive(createMessageEmojiMetadataEntity({ ...input, userIds: [session.value.data.user.id] }));
    storeCreateEmoji(newEmoji);
    Object.assign(newEmoji, await $trpc.emoji.createEmoji.mutate(input));
  };
  const updateEmoji = async (input: UpdateEmojiInput) => {
    storeUpdateEmoji(input);
    await $trpc.emoji.updateEmoji.mutate(input);
  };
  const deleteEmoji = async (input: DeleteEmojiInput) => {
    storeDeleteEmoji(input);
    await $trpc.emoji.deleteEmoji.mutate(input);
  };

  const storeCreateEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojis = getEmojis(newEmoji.messageRowKey);
    emojis.push(newEmoji);
    setEmojis(newEmoji.messageRowKey, emojis);
  };
  const storeUpdateEmoji = (input: UpdateEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    const index = emojis.findIndex(
      ({ partitionKey, rowKey }) => partitionKey === input.partitionKey && rowKey === input.rowKey,
    );
    if (index === -1) return;

    Object.assign(emojis[index], input);
    setEmojis(input.messageRowKey, emojis);
  };
  const storeDeleteEmoji = ({ messageRowKey, partitionKey, rowKey }: DeleteEmojiInput) => {
    const emojis = getEmojis(messageRowKey);
    setEmojis(
      messageRowKey,
      emojis.filter((e) => !(e.partitionKey === partitionKey && e.rowKey === rowKey)),
    );
  };

  return {
    createEmoji,
    deleteEmoji,
    getEmojis,
    setEmojis,
    storeCreateEmoji,
    storeDeleteEmoji,
    storeUpdateEmoji,
    updateEmoji,
  };
});
