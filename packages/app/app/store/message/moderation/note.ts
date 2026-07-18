import type { ModerationNoteEntity, User } from "@esposter/db-schema";

export const useModerationNoteStore = defineStore("message/moderation/note", () => {
  // NotesDialog is instantiated per target user; tracking the current target keeps each user's paginated
  // Notes in its own map slice so concurrent dialogs never overwrite each other's list (last-query-wins).
  const currentTargetUserId = ref("");
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationDataMap<ModerationNoteEntity>(
    () => currentTargetUserId.value,
  );
  // The true note total per target, loaded from countModerationNotes — the paginated items only hold the
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
