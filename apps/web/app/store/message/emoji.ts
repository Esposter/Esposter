import type { ReactionIdentityInput } from "#shared/models/db/message/reaction/ReactionIdentityInput";
import type { RoomReaction } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getOrCreate, ID_SEPARATOR, Operation } from "@esposter/shared";

// A reaction is one emoji on one message, so its identity is the room, the message and the emoji, and a press on it is
// Held while its write is out. A message's id is numbered within its room, so the room is part of the key
const getEmojiKey = ({ emojiTag, messageId, roomId }: ReactionIdentityInput) =>
  `${roomId}${ID_SEPARATOR}${messageId}${ID_SEPARATOR}${emojiTag}`;

export const useEmojiStore = defineStore("message/emoji", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  // A message's reactions, filed under the room they belong to and then under the message. A reaction with no reactor
  // Is Held too, since its removal's version is what an older copy of it loses to
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
  const { checkIsPending, executeMutation } = useMutation();
  // The reaction a press holds while its write is out, which is the one the reaction's button shows as pending
  const checkIsEmojiPending = (input: ReactionIdentityInput) => checkIsPending(getEmojiKey(input));
  const awaitEmojiAnswer = async (input: ReactionIdentityInput, write: () => Promise<RoomReaction>) => {
    if (!session.value.data) return;

    await executeMutation(write, {
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      isExclusive: true,
      key: getEmojiKey(input),
      onError: createErrorAlert,
      onSuccess: (emoji) => {
        storeEmoji(input.roomId, emoji);
      },
    });
  };
  // Each resolves once the room has answered, so a caller that needs the write to have landed can await it
  const createEmoji = (input: ReactionIdentityInput) =>
    awaitEmojiAnswer(input, () => $trpc.message.emoji.addReaction.mutate(input));
  const deleteEmoji = (input: ReactionIdentityInput) =>
    awaitEmojiAnswer(input, () => $trpc.message.emoji.removeReaction.mutate(input));
  // Reacting again removes this user's own reaction; the last one to leave leaves the reaction with no reactor
  const toggleEmoji = async (roomId: string, emoji: RoomReaction) => {
    if (!session.value.data) return;

    const { emojiTag, messageId } = emoji;
    if (emoji.userIds.includes(session.value.data.user.id)) await deleteEmoji({ emojiTag, messageId, roomId });
    else await createEmoji({ emojiTag, messageId, roomId });
  };
  // A deleted message's reactions go with it, and the room sends no removal for them, so each one is emptied at the
  // Version It holds: a read answered before the delete is at that version or older, and the gate refuses it
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    const emojis = getHeldEmojis(roomId, id);
    if (emojis.length > 0)
      setHeldEmojis(
        roomId,
        id,
        emojis.map((emoji) => ({ ...emoji, userIds: [] })),
      );
  });

  return { checkIsEmojiPending, createEmoji, deleteEmoji, getEmojis, storeEmoji, toggleEmoji };
});
