import { useSentMessageStore } from "@/store/message/sentMessage";
import { withFinalizerAsync } from "@esposter/shared";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { count, hasMore, isPending, items, offset } = storeToRefs(sentMessageStore);
  const readSentMessages = () =>
    withFinalizerAsync(
      async () => {
        const { count: total, data } = await $trpc.message.readMySentMessages.query();
        items.value = data.items;
        count.value = total;
        hasMore.value = data.hasMore;
        offset.value = data.items.length;
      },
      () => {
        isPending.value = false;
      },
    );
  const readMoreSentMessages = (onComplete: () => void) =>
    withFinalizerAsync(async () => {
      const { data } = await $trpc.message.readMySentMessages.query({ offset: offset.value });
      items.value = [...items.value, ...data.items];
      hasMore.value = data.hasMore;
      offset.value += data.items.length;
    }, onComplete);
  return { readMoreSentMessages, readSentMessages };
};
