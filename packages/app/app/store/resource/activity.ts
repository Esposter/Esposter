import type { ResourceActivityEntity } from "@esposter/db-schema";

export const useActivityStore = defineStore("resource/activity", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<ResourceActivityEntity>();

  return { hasMore, items, readItems, readMoreItems };
});
