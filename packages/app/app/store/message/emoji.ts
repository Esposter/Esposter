import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { useMutation } from "@/composables/shared/useMutation";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { authClient } from "@/services/auth/authClient";
import { MessageMetadataType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

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
      onSuccess: (result) => {
        Object.assign(newEmoji, result);
      },
    });
  };
  const updateEmoji = async (input: Pick<MessageEmojiMetadataEntity, "userIds"> & UpdateEmojiInput) => {
    if (!session.value.data) return;
    const updatedInput = { ...input, userIds: getUpdatedUserIds(input.userIds, session.value.data.user.id) };
    await executeUpdateEmojiMutation(() => $trpc.message.emoji.updateEmoji.mutate(updatedInput), {
      applyOptimistic: () => {
        storeUpdateEmoji(updatedInput);
        return () => {
          storeUpdateEmoji(input);
        };
      },
    });
  };
  const deleteEmoji = async (input: DeleteEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    const deletedEmoji = emojis.find((emoji) => getIsEntityIdEqualComparator(CompositeAzureKeyPath, input)(emoji));
    await executeDeleteEmojiMutation(() => $trpc.message.emoji.deleteEmoji.mutate(input), {
      applyOptimistic: () => {
        storeDeleteEmoji(input);
        return () => {
          if (deletedEmoji) storeCreateEmoji(deletedEmoji);
        };
      },
    });
  };

  const storeCreateEmoji = (newEmoji: MessageEmojiMetadataEntity) => {
    const emojis = getEmojis(newEmoji.messageRowKey);
    emojis.push(newEmoji);
    setEmojis(newEmoji.messageRowKey, emojis);
  };
  const storeUpdateEmoji = (input: UpdateEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    const index = emojis.findIndex((e) => getIsEntityIdEqualComparator(CompositeAzureKeyPath, input)(e));
    if (index === -1) return;

    Object.assign(takeOne(emojis, index), input);
    setEmojis(input.messageRowKey, emojis);
  };
  const storeDeleteEmoji = (input: DeleteEmojiInput) => {
    const emojis = getEmojis(input.messageRowKey);
    setEmojis(
      input.messageRowKey,
      emojis.filter((e) => !getIsEntityIdEqualComparator(CompositeAzureKeyPath, input)(e)),
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
