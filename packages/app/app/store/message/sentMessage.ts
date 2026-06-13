import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const items = ref<SentMessageWithRoom[]>([]);
  const count = ref(0);
  const hasMore = ref(false);
  const offset = ref(0);
  const isPending = ref(true);
  return { count, hasMore, isPending, items, offset };
});
