import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { authClient } from "@/services/auth/authClient";
import { MessageMetadataType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

export const useEmojiStore = defineStore("message/emoji", () => {
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
  const updateEmoji = async (input: Pick<MessageEmojiMetadataEntity, "userIds"> & UpdateEmojiInput) => {
    if (!session.value.data) return;
    const updatedInput = { ...input, userIds: getUpdatedUserIds(input.userIds, session.value.data.user.id) };
    storeUpdateEmoji(updatedInput);
    await $trpc.emoji.updateEmoji.mutate(updatedInput);
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
    const index = emojis.findIndex((e) => getIsEntityIdEqualComparator(["partitionKey", "rowKey"], input)(e));
    if (index === -1) return;

    Object.assign(takeOne(emojis, index), input);
    setEmojis(input.messageRowKey, emojis);
  };
  const storeDeleteEmoji = (input: DeleteEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    setEmojis(
      input.messageRowKey,
      emojis.filter((e) => !getIsEntityIdEqualComparator(["partitionKey", "rowKey"], input)(e)),
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
