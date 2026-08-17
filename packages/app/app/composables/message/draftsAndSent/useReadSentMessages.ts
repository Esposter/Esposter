import { useSentMessageStore } from "@/store/message/sentMessage";
import { withFinalizerAsync } from "@esposter/shared";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems } = sentMessageStore;
  const { count, hasMore, isPending, items, offset } = storeToRefs(sentMessageStore);
  const readSentMessages = () =>
    readItems(
      async () => {
        const { count: total, data } = await $trpc.message.readMySentMessages.query();
        count.value = total;
        offset.value = data.items.length;
        return data;
      },
      {
        onComplete: () => {
          isPending.value = false;
        },
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
