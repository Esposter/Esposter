import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const { hasMore, isLoaded, items, readItems, readMoreItems } = useCursorPaginationData<SentMessageWithRoom>();

  return { hasMore, isLoaded, items, readItems, readMoreItems };
});
