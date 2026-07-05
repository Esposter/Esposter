import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const { hasMore, items, ...restData } = useOffsetPaginationData<SentMessageWithRoom>();
  const count = ref(0);
  const offset = ref(0);
  const isPending = ref(true);
  return { count, hasMore, isPending, items, offset, ...restData };
});
