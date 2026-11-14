import type { AddReactionInput } from "#shared/models/db/message/reaction/AddReactionInput";
import type { RemoveReactionInput } from "#shared/models/db/message/reaction/RemoveReactionInput";
import type { RoomReaction } from "@esposter/db-schema";
import { authClient } from "@/services/auth/authClient";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { getOrCreate, ID_SEPARATOR } from "@esposter/shared";

// A reaction is one emoji on one message, so its identity is the pair, and every write queues on that pair
const getEmojiKey = ({ emojiTag, messageId }: Pick<RoomReaction, "emojiTag" | "messageId">) =>
  `${messageId}${ID_SEPARATOR}${emojiTag}`;

export const useEmojiStore = defineStore("message/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateEmojiMutation } = useMutation();
  const { executeMutation: executeDeleteEmojiMutation } = useMutation();
  // A message's reactions, filed under the room they belong to and then under the message. Every write names both,
  // Since a read response, a subscription echo and a rollback all land after an await, when the room on screen may have moved on
  const emojiMap: Ref<Map<string, Map<number, RoomReaction[]>>> = ref(new Map());
  // A read never writes, since a read can run during a render: a message nothing has set reads as none, and only a set
  // Makes an entry
  const getEmojis = (roomId: string, messageId: number) => emojiMap.value.get(roomId)?.get(messageId) ?? [];
  const setEmojis = (roomId: string, messageId: number, emojis: RoomReaction[]) => {
    getOrCreate(emojiMap.value, roomId, () => new Map<number, RoomReaction[]>()).set(messageId, emojis);
  };
  const findEmoji = (roomId: string, emoji: Pick<RoomReaction, "emojiTag" | "messageId">) =>
    getEmojis(roomId, emoji.messageId).find(getEntityIdEqualComparator(["emojiTag"], emoji));
  // Puts the reaction in place of the one it identifies, or adds it, and returns what was there before for a rollback
  // A room event carries the whole row as the room holds it after a create or an update, so both are one write here
  const storeEmoji = (roomId: string, emoji: RoomReaction) => {
    const previousEmoji = findEmoji(roomId, emoji);
    const emojis = getEmojis(roomId, emoji.messageId);
    setEmojis(
      roomId,
      emoji.messageId,
      previousEmoji ? emojis.map((item) => (item === previousEmoji ? emoji : item)) : [...emojis, emoji],
    );
  };
  // Puts the caller in or takes them out of the reaction as it stands now, so what other members did while the write was
  // in flight is kept. The reaction goes with its last reactor
  const storeReactor = (
    roomId: string,
    { emojiTag, messageId }: Pick<RoomReaction, "emojiTag" | "messageId">,
    userId: string,
    isReactor: boolean,
  ) => {
    const userIds = (findEmoji(roomId, { emojiTag, messageId })?.userIds ?? []).filter(
      (reactorId) => reactorId !== userId,
    );
    if (isReactor) userIds.push(userId);
    if (userIds.length > 0) storeEmoji(roomId, { emojiTag, messageId, userIds });
    else storeDeleteEmoji(roomId, { emojiTag, messageId });
  };
  const createEmoji = async (input: AddReactionInput) => {
    if (!session.value.data) return;

    const { id: userId } = session.value.data.user;
    await executeCreateEmojiMutation(() => $trpc.message.emoji.addReaction.mutate(input), {
      applyOptimistic: () => {
        storeReactor(input.roomId, input, userId, true);
        return () => {
          storeReactor(input.roomId, input, userId, false);
        };
      },
      // Keyed per emoji identity so reacting with two emojis in quick succession never queues behind the other
      key: getEmojiKey(input),
      // The room does not echo a write back to the device that made it, so the row the server settled is applied here
      onSuccess: (result) => {
        storeEmoji(input.roomId, result);
      },
    });
  };
  const deleteEmoji = async (input: RemoveReactionInput) => {
    if (!session.value.data) return;

    const { id: userId } = session.value.data.user;
    await executeDeleteEmojiMutation(() => $trpc.message.emoji.removeReaction.mutate(input), {
      applyOptimistic: () => {
        storeReactor(input.roomId, input, userId, false);
        return () => {
          storeReactor(input.roomId, input, userId, true);
        };
      },
      key: getEmojiKey(input),
    });
  };
  // Reacting again removes this user's own reaction; the last one to leave takes the reaction itself with it
  const toggleEmoji = async (roomId: string, emoji: RoomReaction) => {
    if (!session.value.data) return;

    const { emojiTag, messageId } = emoji;
    if (emoji.userIds.includes(session.value.data.user.id)) await deleteEmoji({ emojiTag, messageId, roomId });
    else await createEmoji({ emojiTag, messageId, roomId });
  };

  const storeDeleteEmoji = (roomId: string, input: Pick<RoomReaction, "emojiTag" | "messageId">) => {
    const emojis = getEmojis(roomId, input.messageId);
    setEmojis(
      roomId,
      input.messageId,
      emojis.filter((emoji) => !getEntityIdEqualComparator(["emojiTag"], input)(emoji)),
    );
  };

  return { createEmoji, deleteEmoji, getEmojis, setEmojis, storeDeleteEmoji, storeEmoji, toggleEmoji };
});
