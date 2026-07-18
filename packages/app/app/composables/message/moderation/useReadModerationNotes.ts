import type { RoomInMessage, User } from "@esposter/db-schema";

import { useModerationNoteStore } from "@/store/message/moderation/note";

export const useReadModerationNotes = (roomId: RoomInMessage["id"], targetUserId: MaybeRefOrGetter<User["id"]>) => {
  const { $trpc } = useNuxtApp();
  const { readItems, readMoreItems } = useModerationNoteStore();
  const readModerationNotes = () =>
    readItems(() =>
      $trpc.message.moderation.readModerationNotes.query({ roomId, targetUserId: toValue(targetUserId) }),
    );
  const readMoreModerationNotes = (onComplete: () => void) =>
    readMoreItems(
      (cursor) =>
        $trpc.message.moderation.readModerationNotes.query({ cursor, roomId, targetUserId: toValue(targetUserId) }),
      onComplete,
    );
  return { readModerationNotes, readMoreModerationNotes };
};
