import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export const useSentMessageStore = defineStore("message/sentMessage", () => {
  const offsetPaginationData = useOffsetPaginationData<SentMessageWithRoom>();
  const isPending = ref(true);
  const sentMessageCount = ref(0);
  return { isPending, sentMessageCount, ...offsetPaginationData };
});
