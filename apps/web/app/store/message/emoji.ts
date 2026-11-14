import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { authClient } from "@/services/auth/authClient";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { checkIsOnlyReactor, getOrCreate, getUpdatedUserIds, ID_SEPARATOR, takeOne } from "@esposter/shared";

export const useEmojiStore = defineStore("message/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateEmojiMutation } = useMutation();
  const { executeMutation: executeUpdateEmojiMutation } = useMutation();
  const { executeMutation: executeDeleteEmojiMutation } = useMutation();
  // A message's reactions, filed under the room they belong to and then under the message. Every write names both,
  // Since a read response, a subscription echo and a rollback all land after an await, when the room on screen may have moved on
  const emojiMap: Ref<Map<string, Map<string, MessageEmojiMetadataEntity[]>>> = ref(new Map());
  // A read never writes, since a read can run during a render: a message nothing has set reads as none, and only a set
  // Makes an entry
  const getEmojis = (roomId: string, messageId: string) => emojiMap.value.get(roomId)?.get(messageId) ?? [];
  const setEmojis = (roomId: string, messageId: string, emojis: MessageEmojiMetadataEntity[]) => {
    getOrCreate(emojiMap.value, roomId, () => new Map<string, MessageEmojiMetadataEntity[]>()).set(messageId, emojis);
  };
  // A reaction is one emoji on one message, so its identity is the pair, and every write queues on that pair
  const getEmojiKey = ({ emojiTag, messageId }: Pick<MessageEmojiMetadataEntity, "emojiTag" | "messageId">) =>
    `${messageId}${ID_SEPARATOR}${emojiTag}`;
  const createEmoji = async (input: CreateEmojiInput) => {
    if (!session.value.data) return;
    const newEmoji = reactive({
      emojiTag: input.emojiTag,
      messageId: input.messageId,
      userIds: [session.value.data.user.id],
    });
    await executeCreateEmojiMutation(() => $trpc.message.emoji.createEmoji.mutate(input), {
      applyOptimistic: () => {
        storeCreateEmoji(input.roomId, newEmoji);
        return () => {
          storeDeleteEmoji(input.roomId, newEmoji);
        };
      },
      // Keyed per emoji identity so reacting with two emojis in quick succession never queues behind the other
      // The first one's rollback or server-entity assignment
      key: getEmojiKey(newEmoji),
      onSuccess: (result) => {
        Object.assign(newEmoji, result);
      },
    });
  };
  const updateEmoji = async (input: Pick<MessageEmojiMetadataEntity, "messageId" | "userIds"> & UpdateEmojiInput) => {
    if (!session.value.data) return;
    const { id: userId } = session.value.data.user;
    const updatedInput = { ...input, userIds: getUpdatedUserIds(input.userIds, userId) };
    await executeUpdateEmojiMutation(() => $trpc.message.emoji.updateEmoji.mutate(updatedInput), {
      applyOptimistic: () => {
        storeUpdateEmoji(input.roomId, updatedInput);
        return () => {
          // Toggle this user back out of the reaction as it stands
          const currentEmoji = getEmojis(input.roomId, input.messageId).find((emoji) =>
            getEntityIdEqualComparator(["emojiTag"], input)(emoji),
          );
          if (!currentEmoji) return;

          storeUpdateEmoji(input.roomId, { ...input, userIds: getUpdatedUserIds(currentEmoji.userIds, userId) });
        };
      },
      key: getEmojiKey(input),
    });
  };
  const deleteEmoji = async (input: DeleteEmojiInput) => {
    await executeDeleteEmojiMutation(() => $trpc.message.emoji.deleteEmoji.mutate(input), {
      // Read as the write is sent, so a rejected removal puts back the reaction as the write ahead of it left it
      applyOptimistic: () => {
        const deletedEmoji = getEmojis(input.roomId, input.messageId).find((emoji) =>
          getEntityIdEqualComparator(["emojiTag"], input)(emoji),
        );
        storeDeleteEmoji(input.roomId, input);
        return () => {
          if (deletedEmoji) storeCreateEmoji(input.roomId, deletedEmoji);
        };
      },
      key: getEmojiKey(input),
    });
  };
  // Reacting again removes this user's own reaction; the last one to leave takes the reaction itself with it
  const toggleEmoji = async (roomId: string, emoji: MessageEmojiMetadataEntity) => {
    if (!session.value.data) return;

    const { emojiTag, messageId, userIds } = emoji;
    if (checkIsOnlyReactor(userIds, session.value.data.user.id)) await deleteEmoji({ emojiTag, messageId, roomId });
    else await updateEmoji({ emojiTag, messageId, roomId, userIds });
  };

  const storeCreateEmoji = (roomId: string, newEmoji: MessageEmojiMetadataEntity) => {
    const emojis = getEmojis(roomId, newEmoji.messageId);
    emojis.push(newEmoji);
    setEmojis(roomId, newEmoji.messageId, emojis);
  };
  // The fields written ride along with the identity — every caller updates `userIds`, which the identity alone
  // Cannot name, and the assign below is what applies them
  const storeUpdateEmoji = (
    roomId: string,
    input: Partial<MessageEmojiMetadataEntity> & Pick<MessageEmojiMetadataEntity, "messageId"> & UpdateEmojiInput,
  ) => {
    const emojis = getEmojis(roomId, input.messageId);
    const index = emojis.findIndex((emoji) => getEntityIdEqualComparator(["emojiTag"], input)(emoji));
    if (index === -1) return;

    Object.assign(takeOne(emojis, index), input);
    setEmojis(roomId, input.messageId, emojis);
  };
  const storeDeleteEmoji = (roomId: string, input: Pick<MessageEmojiMetadataEntity, "emojiTag" | "messageId">) => {
    const emojis = getEmojis(roomId, input.messageId);
    setEmojis(
      roomId,
      input.messageId,
      emojis.filter((emoji) => !getEntityIdEqualComparator(["emojiTag"], input)(emoji)),
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
