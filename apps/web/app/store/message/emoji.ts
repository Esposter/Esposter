import type { AddReactionInput } from "#shared/models/db/message/reaction/AddReactionInput";
import type { RemoveReactionInput } from "#shared/models/db/message/reaction/RemoveReactionInput";
import type { RoomReaction } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";
import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getOrCreate, getResultAsync, ID_SEPARATOR, Operation, withFinalizerAsync } from "@esposter/shared";

// A reaction is one emoji on one message, so its identity is the room, the message and the emoji, and a press on it is
// Held while its write is out. A message's id is numbered within its room, so the room is part of the key
const getEmojiKey = ({ emojiTag, messageId, roomId }: AddReactionInput) =>
  `${roomId}${ID_SEPARATOR}${messageId}${ID_SEPARATOR}${emojiTag}`;

export const useEmojiStore = defineStore("message/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  // A message's reactions, filed under the room they belong to and then under the message. A reaction with no reactor is
  // Held too, since its removal's version is what an older copy of it loses to
  const emojiMap: Ref<Map<string, Map<number, RoomReaction[]>>> = ref(new Map());
  const getHeldEmojis = (roomId: string, messageId: number) => emojiMap.value.get(roomId)?.get(messageId) ?? [];
  const setHeldEmojis = (roomId: string, messageId: number, emojis: RoomReaction[]) => {
    getOrCreate(emojiMap.value, roomId, () => new Map<number, RoomReaction[]>()).set(messageId, emojis);
  };
  // A read never writes, since a read can run during a render: a message nothing has set reads as none
  const getEmojis = (roomId: string, messageId: number) =>
    getHeldEmojis(roomId, messageId).filter(({ userIds }) => userIds.length > 0);
  const findEmoji = (roomId: string, emoji: Pick<RoomReaction, "emojiTag" | "messageId">) =>
    getHeldEmojis(roomId, emoji.messageId).find(getEntityIdEqualComparator(["emojiTag"], emoji));
  // The one write a reaction takes: the room's answer to an add or a removal, an event, or a read. It applies only when
  // Nothing is held for the reaction or its version is newer, so a late read cannot re-add a removed reaction and an
  // Older event cannot undo a newer toggle
  const storeEmoji = (roomId: string, emoji: RoomReaction) => {
    const heldEmoji = findEmoji(roomId, emoji);
    if (!checkIsNewerArrival(heldEmoji, emoji)) return;

    const emojis = getHeldEmojis(roomId, emoji.messageId);
    setHeldEmojis(
      roomId,
      emoji.messageId,
      heldEmoji ? emojis.map((item) => (item === heldEmoji ? emoji : item)) : [...emojis, emoji],
    );
  };
  // A press on a reaction is not sent while the one before it is out, since the room has not yet answered what that one
  // Did. The reaction shows what the room holds until the answer lands, as an awaited write has no entry to show it
  const pendingEmojiKeys = ref(new Set<string>());
  const awaitEmojiAnswer = async (input: AddReactionInput, write: () => Promise<RoomReaction>) => {
    const emojiKey = getEmojiKey(input);
    if (!session.value.data || pendingEmojiKeys.value.has(emojiKey)) return;

    pendingEmojiKeys.value.add(emojiKey);
    await withFinalizerAsync(
      () =>
        getResultAsync(write).match(
          (emoji) => {
            storeEmoji(input.roomId, emoji);
          },
          (error) => {
            createErrorAlert(error);
          },
        ),
      () => {
        pendingEmojiKeys.value.delete(emojiKey);
      },
    );
  };
  // Each resolves once the room has answered, so a caller that needs the write to have landed can await it
  const createEmoji = (input: AddReactionInput) =>
    awaitEmojiAnswer(input, () => $trpc.message.emoji.addReaction.mutate(input));
  const deleteEmoji = (input: RemoveReactionInput) =>
    awaitEmojiAnswer(input, () => $trpc.message.emoji.removeReaction.mutate(input));
  // Reacting again removes this user's own reaction; the last one to leave leaves the reaction with no reactor
  const toggleEmoji = async (roomId: string, emoji: RoomReaction) => {
    if (!session.value.data) return;

    const { emojiTag, messageId } = emoji;
    if (emoji.userIds.includes(session.value.data.user.id)) await deleteEmoji({ emojiTag, messageId, roomId });
    else await createEmoji({ emojiTag, messageId, roomId });
  };
  // A deleted message's reactions go with it, and the room sends no removal for them, so each one is emptied at the version
  // It holds: a read answered before the delete is at that version or older, and the gate refuses it
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    const emojis = getHeldEmojis(roomId, id);
    if (emojis.length > 0)
      setHeldEmojis(
        roomId,
        id,
        emojis.map((emoji) => ({ ...emoji, userIds: [] })),
      );
  });

  return { createEmoji, deleteEmoji, getEmojis, storeEmoji, toggleEmoji };
});
