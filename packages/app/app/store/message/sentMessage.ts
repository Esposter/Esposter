import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const offsetPaginationData = useOffsetPaginationData<SentMessageWithRoom>();
  const count = ref(0);
  const offset = ref(0);
  const isPending = ref(true);
  return { count, isPending, offset, ...offsetPaginationData };
});
