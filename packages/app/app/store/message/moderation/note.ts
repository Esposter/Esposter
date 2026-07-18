import type { ModerationNoteEntity } from "@esposter/db-schema";

export const useModerationNoteStore = defineStore("message/moderation/note", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<ModerationNoteEntity>();

  return { hasMore, items, readItems, readMoreItems };
});
