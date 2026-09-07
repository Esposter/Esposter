import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { authClient } from "@/services/auth/authClient";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { MessageMetadataType } from "@esposter/db-schema";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

export const useEmojiStore = defineStore("message/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateEmojiMutation } = useMutation();
  const { executeMutation: executeUpdateEmojiMutation } = useMutation();
  const { executeMutation: executeDeleteEmojiMutation } = useMutation();
  const { getEmojis, setEmojis } = useMessageMetadataMap(MessageMetadataType.Emoji);
  const createEmoji = async (input: CreateEmojiInput) => {
    if (!session.value.data) return;
    const newEmoji = reactive(createMessageEmojiMetadataEntity({ ...input, userIds: [session.value.data.user.id] }));
    await executeCreateEmojiMutation(() => $trpc.message.emoji.createEmoji.mutate(input), {
      applyOptimistic: () => {
        storeCreateEmoji(newEmoji);
        return () => {
          storeDeleteEmoji(newEmoji);
        };
      },
      // Keyed per emoji identity so reacting with two emojis in quick succession never queues behind the other
      // The first one's rollback or server-entity assignment
      key: `${input.messageRowKey}${ID_SEPARATOR}${input.emojiTag}`,
      onSuccess: (result) => {
        Object.assign(newEmoji, result);
      },
    });
  };
  const updateEmoji = async (input: Pick<MessageEmojiMetadataEntity, "userIds"> & UpdateEmojiInput) => {
    if (!session.value.data) return;
    const { id: userId } = session.value.data.user;
    const updatedInput = { ...input, userIds: getUpdatedUserIds(input.userIds, userId) };
    await executeUpdateEmojiMutation(() => $trpc.message.emoji.updateEmoji.mutate(updatedInput), {
      applyOptimistic: () => {
        storeUpdateEmoji(updatedInput);
        return () => {
          // Toggle this user back out of the reaction as it stands
          const currentEmoji = getEmojis(input.messageRowKey).find((emoji) =>
            getEntityIdEqualComparator(CompositeAzureKeyPath, input)(emoji),
          );
          if (!currentEmoji) return;

          storeUpdateEmoji({ ...input, userIds: getUpdatedUserIds(currentEmoji.userIds, userId) });
        };
      },
      key: input.rowKey,
    });
  };
  const deleteEmoji = async (input: DeleteEmojiInput) => {
    await executeDeleteEmojiMutation(() => $trpc.message.emoji.deleteEmoji.mutate(input), {
      // Read as the write is sent, so a rejected removal puts back the reaction as the write ahead of it left it
      applyOptimistic: () => {
        const deletedEmoji = getEmojis(input.messageRowKey).find((emoji) =>
          getEntityIdEqualComparator(CompositeAzureKeyPath, input)(emoji),
        );
        storeDeleteEmoji(input);
        return () => {
          if (deletedEmoji) storeCreateEmoji(deletedEmoji);
        };
      },
      key: input.rowKey,
    });
  };

  // Reacting again removes this user's own reaction; the last one to leave takes the reaction itself with it
  const toggleEmoji = async (emoji: MessageEmojiMetadataEntity) => {
    if (!session.value.data) return;

    const { messageRowKey, partitionKey, rowKey, userIds } = emoji;
    if (userIds.length === 1 && userIds.includes(session.value.data.user.id))
      await deleteEmoji({ messageRowKey, partitionKey, rowKey });
    else await updateEmoji({ messageRowKey, partitionKey, rowKey, userIds });
  };

  const storeCreateEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojis = getEmojis(newEmoji.messageRowKey);
    emojis.push(newEmoji);
    setEmojis(newEmoji.messageRowKey, emojis);
  };
  // The fields written ride along with the identity — every caller updates `userIds`, which the identity alone
  // Cannot name, and the assign below is what applies them
  const storeUpdateEmoji = (input: Partial<MessageEmojiMetadataEntity> & UpdateEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    const index = emojis.findIndex((emoji) => getEntityIdEqualComparator(CompositeAzureKeyPath, input)(emoji));
    if (index === -1) return;

    Object.assign(takeOne(emojis, index), input);
    setEmojis(input.messageRowKey, emojis);
  };
  const storeDeleteEmoji = (input: DeleteEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    setEmojis(
      input.messageRowKey,
      emojis.filter((emoji) => !getEntityIdEqualComparator(CompositeAzureKeyPath, input)(emoji)),
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
    toggleEmoji,
    updateEmoji,
  };
});
