import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { useSentMessageStore } from "@/store/message/sentMessage";
import { jsonDateParse } from "@esposter/shared";

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems, readMoreItems } = sentMessageStore;
  const readSentMessages = () => readItems(() => $trpc.message.readMySentMessages.query());
  const readMoreSentMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const { before } = readMySentMessagesInputSchema.parse({ before: jsonDateParse(cursor) });
      return $trpc.message.readMySentMessages.query({ before });
    }, onComplete);

  return { readMoreSentMessages, readSentMessages };
};
