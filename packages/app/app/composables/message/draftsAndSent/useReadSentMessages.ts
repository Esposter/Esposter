import { useSentMessageStore } from "@/store/message/sentMessage";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems, readMoreItems } = sentMessageStore;
  const { count, isPending } = storeToRefs(sentMessageStore);
  const readSentMessages = () =>
    readItems(
      async () => {
        const { count: total, data } = await $trpc.message.readMySentMessages.query();
        count.value = total;
        return data;
      },
      () => {
        isPending.value = false;
      },
    );
  const readMoreSentMessages = (onComplete: () => void) =>
    readMoreItems(async (offset) => {
      const { data } = await $trpc.message.readMySentMessages.query({ offset });
      return data;
    }, onComplete);
  return { readMoreSentMessages, readSentMessages };
};
