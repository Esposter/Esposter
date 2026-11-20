import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

// A note is a server-minted row the notes list holds outside the overlay, so its write is awaited: nothing is drawn before
// The answer, and the list is read again once the server has kept the note. Resolves to whether the server kept it
export const useCreateModerationNote = (
  roomId: RoomInMessage["id"],
  targetUserId: MaybeRefOrGetter<PublicUser["id"]>,
) => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { writeAwaited } = overlayStore;
  const { readModerationNotes } = useReadModerationNotes(roomId, targetUserId);
  // An awaited write has no entry to say it is pending, so the form reads the count of notes out
  const pendingCount = ref(0);
  const isCreatePending = computed(() => pendingCount.value > 0);
  const createModerationNote = async (note: string): Promise<boolean> => {
    // One note at a time, since the field holds the note until its answer, and a second send would post it twice
    if (pendingCount.value > 0) return false;

    const outcome = { isKept: false };
    pendingCount.value += 1;
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            await $trpc.message.moderation.createModerationNote.mutate({
              note,
              roomId,
              targetUserId: toValue(targetUserId),
            });
            outcome.isKept = true;
            await readModerationNotes();
            return [];
          },
          { onError: createErrorAlert },
        ),
      () => {
        pendingCount.value -= 1;
      },
    );
    return outcome.isKept;
  };

  return { createModerationNote, isCreatePending };
};
