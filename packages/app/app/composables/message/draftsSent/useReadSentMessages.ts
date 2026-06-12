import { useSentMessageStore } from "@/store/message/sentMessage";
import { withFinalizerAsync } from "@esposter/shared";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { count, hasMore, isPending, items } = storeToRefs(sentMessageStore);
  const readSentMessages = async () => {
    const { count: total, data } = await $trpc.message.readMySentMessages.query();
    items.value = data.items;
    count.value = total;
    hasMore.value = data.hasMore;
    isPending.value = false;
  };
  const readMoreSentMessages = (onComplete: () => void) =>
    withFinalizerAsync(async () => {
      const { data } = await $trpc.message.readMySentMessages.query({ offset: items.value.length });
      items.value = [...items.value, ...data.items];
      hasMore.value = data.hasMore;
    }, onComplete);
  return { readMoreSentMessages, readSentMessages };
};
