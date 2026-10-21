import type { ModerationLogInRoom } from "#shared/models/db/room/ModerationLogInRoom";

export const useModerationLogStore = defineStore("message/moderation/log", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<ModerationLogInRoom>();

  return { hasMore, items, readItems, readMoreItems };
});
