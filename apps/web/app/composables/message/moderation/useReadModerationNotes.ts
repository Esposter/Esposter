import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { useModerationNoteStore } from "#src/store/message/moderation/note";

export const useReadModerationNotes = (
  roomId: RoomInMessage["id"],
  targetUserId: MaybeRefOrGetter<PublicUser["id"]>,
) => {
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
        $trpc.message.moderation.readModerationNotesCount.query({ roomId, targetUserId: targetUserIdValue }),
      ]);
      setModerationNoteCount(targetUserIdValue, count);
      return moderationNotes;
    });
  const readMoreModerationNotes = (onComplete: () => void) => {
    // Taken as the read is issued, so a retry after the dialog moved to another target still asks for this target's notes
    const issuedTargetUserId = toValue(targetUserId);
    return readMoreItems(
      (cursor) =>
        $trpc.message.moderation.readModerationNotes.query({ cursor, roomId, targetUserId: issuedTargetUserId }),
      onComplete,
    );
  };
  return { readModerationNotes, readMoreModerationNotes };
};
