import { useSentMessageStore } from "@/store/message/sentMessage";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems, readMoreItems } = sentMessageStore;
  const { isPending, sentMessageCount } = storeToRefs(sentMessageStore);
  const readSentMessages = () =>
    readItems(
      async () => {
        const { count, data: sentMessages } = await $trpc.message.readMySentMessages.query();
        sentMessageCount.value = count;
        return sentMessages;
      },
      () => {
        isPending.value = false;
      },
    );
  const readMoreSentMessages = (onComplete: () => void) =>
    readMoreItems(async (offset) => {
      const { data: sentMessages } = await $trpc.message.readMySentMessages.query({ offset });
      return sentMessages;
    }, onComplete);
  return { readMoreSentMessages, readSentMessages };
};
