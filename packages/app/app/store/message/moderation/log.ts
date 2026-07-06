import type { ModerationLogEntity } from "@esposter/db-schema";

export const useModerationLogStore = defineStore("message/moderation/log", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<ModerationLogEntity>();

  return { hasMore, items, readItems, readMoreItems };
});
