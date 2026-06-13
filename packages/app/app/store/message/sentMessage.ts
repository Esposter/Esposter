import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const items = ref<SentMessageWithRoom[]>([]);
  const count = ref(0);
  const hasMore = ref(false);
  const isPending = ref(true);
  const nextOffset = ref(0);
  return { count, hasMore, isPending, items, nextOffset };
});
