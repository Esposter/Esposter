import type { RoomInMessage, User } from "@esposter/db-schema";

import { useModerationNoteStore } from "@/store/message/moderation/note";

export const useReadModerationNotes = (roomId: RoomInMessage["id"], targetUserId: MaybeRefOrGetter<User["id"]>) => {
  const { $trpc } = useNuxtApp();
  const moderationNoteStore = useModerationNoteStore();
  const { readItems, readMoreItems, setModerationNoteCount } = moderationNoteStore;
  // The badge's total rides the list's own read rather than running beside it: same target, same trip, and
  // `readItems` absorbs what its query rejects with — alongside it the count reached callers with nothing to
  // Catch it, one of them an `onSuccess` whose rejection escapes its mutation
  const readModerationNotes = () =>
    readItems(async () => {
      const targetUserIdValue = toValue(targetUserId);
      const [moderationNotes, count] = await Promise.all([
        $trpc.message.moderation.readModerationNotes.query({ roomId, targetUserId: targetUserIdValue }),
        $trpc.message.moderation.countModerationNotes.query({ roomId, targetUserId: targetUserIdValue }),
      ]);
      setModerationNoteCount(targetUserIdValue, count);
      return moderationNotes;
    });
  const readMoreModerationNotes = (onComplete: () => void) =>
    readMoreItems(
      (cursor) =>
        $trpc.message.moderation.readModerationNotes.query({ cursor, roomId, targetUserId: toValue(targetUserId) }),
      onComplete,
    );
  return { readModerationNotes, readMoreModerationNotes };
};
