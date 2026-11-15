import { useSentMessageStore } from "@/store/message/sentMessage";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems, readMoreItems } = sentMessageStore;
  const readSentMessages = () => readItems(() => $trpc.message.readMySentMessages.query());
  const readMoreSentMessages = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.message.readMySentMessages.query({ cursor }), onComplete);

  return { readMoreSentMessages, readSentMessages };
};
