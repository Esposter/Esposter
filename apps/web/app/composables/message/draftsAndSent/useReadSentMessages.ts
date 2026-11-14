import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";

import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { useSentMessageStore } from "@/store/message/sentMessage";

// The next page starts after the last sent message this page resolved, named by the triple its index holds it under. A
// message its room no longer holds is dropped from the page, so the cursor is the last one that survived, and the page
// after it re-reads only what came after that
const toSentMessagePage = ({ hasMore, items }: ReadMySentMessagesResult): CursorPaginationData<SentMessageWithRoom> => {
  const oldestItem = items.at(-1);
  return {
    hasMore,
    items,
    nextCursor:
      hasMore && oldestItem
        ? JSON.stringify({
            createdAt: oldestItem.message.createdAt,
            messageId: oldestItem.message.id,
            roomId: oldestItem.room.id,
          })
        : "",
  };
};

export const useReadSentMessages = () => {
  const { $trpc } = useNuxtApp();
  const sentMessageStore = useSentMessageStore();
  const { readItems, readMoreItems } = sentMessageStore;
  const readSentMessages = () =>
    readItems(async () => toSentMessagePage(await $trpc.message.readMySentMessages.query({})));
  const readMoreSentMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const { before } = readMySentMessagesInputSchema.parse({ before: JSON.parse(cursor) });
      return toSentMessagePage(await $trpc.message.readMySentMessages.query({ before }));
    }, onComplete);

  return { readMoreSentMessages, readSentMessages };
};
