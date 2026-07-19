import type { RoomInMessage, User } from "@esposter/db-schema";

import { useModerationNoteStore } from "@/store/message/moderation/note";

export const useReadModerationNotes = (roomId: RoomInMessage["id"], targetUserId: MaybeRefOrGetter<User["id"]>) => {
  const { $trpc } = useNuxtApp();
  const { readItems, readMoreItems, setModerationNoteCount } = useModerationNoteStore();
  const readModerationNoteCount = async () => {
    const targetUserIdValue = toValue(targetUserId);
    const count = await $trpc.message.moderation.countModerationNotes.query({
      roomId,
      targetUserId: targetUserIdValue,
    });
    setModerationNoteCount(targetUserIdValue, count);
  };
  const readModerationNotes = () =>
    Promise.all([
      readItems(() =>
        $trpc.message.moderation.readModerationNotes.query({ roomId, targetUserId: toValue(targetUserId) }),
      ),
      readModerationNoteCount(),
    ]);
  const readMoreModerationNotes = (onComplete: () => void) =>
    readMoreItems(
      (cursor) =>
        $trpc.message.moderation.readModerationNotes.query({ cursor, roomId, targetUserId: toValue(targetUserId) }),
      onComplete,
    );
  return { readModerationNotes, readMoreModerationNotes };
};
