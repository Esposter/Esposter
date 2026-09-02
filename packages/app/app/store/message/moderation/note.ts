import type { ModerationNoteEntity, User } from "@esposter/db-schema";

export const useModerationNoteStore = defineStore("message/moderation/note", () => {
  // NotesDialog is instantiated per target user, and only ever one at a time — it lives inside a v-menu, whose
  // Content Vuetify unmounts once closed — so this names whichever dialog is currently open and each user's
  // Notes keep their own map slice. A read files its result under the target it was issued for regardless,
  // Because useCursorPaginationDataMap binds the slice at issue time
  const currentTargetUserId = ref("");
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationDataMap<ModerationNoteEntity>(
    () => currentTargetUserId.value,
  );
  // The true note total per target, loaded from readModerationNotesCount — the paginated items only hold the
  // Loaded page, so the badge reads this instead of items.length.
  const { getData: getStoredCount, setData: setModerationNoteCount } = useDataMap<number>(
    () => currentTargetUserId.value,
    0,
  );
  const getModerationNoteCount = (targetUserId: User["id"]) => getStoredCount(targetUserId) ?? 0;
  return {
    currentTargetUserId,
    getModerationNoteCount,
    hasMore,
    items,
    readItems,
    readMoreItems,
    setModerationNoteCount,
  };
});
