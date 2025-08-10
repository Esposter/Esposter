import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMessages = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { initializeCursorPaginationData, pushMessages, unshiftMessages } = messageStore;
  const { hasMore, hasMoreNewer, nextCursor, nextCursorNewer } = storeToRefs(messageStore);
  const readUsers = useReadUsers();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  const readMetadata = (messages: MessageEntity[]) =>
    Promise.all([
      readUsers(messages.map(({ userId }) => userId)),
      readReplies([...new Set(messages.map(({ replyRowKey }) => replyRowKey).filter((value) => value !== undefined))]),
      readFiles(messages.flatMap(({ files }) => files)),
      readEmojis(messages.map(({ rowKey }) => rowKey)),
    ]);
  const readMoreMessages = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.message.readMessages.query({
        cursor: nextCursor.value,
        roomId: currentRoomId.value,
      });
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      await readMetadata(items);
      pushMessages(...items);
    } finally {
      onComplete();
    }
  };
  const readMoreNewerMessages = async (onComplete: () => Promise<void>) => {
    try {
      if (!currentRoomId.value) return;

      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.message.readMessages.query({
        cursor: nextCursorNewer.value,
        order: SortOrder.Asc,
        roomId: currentRoomId.value,
      });
      nextCursorNewer.value = newNextCursor;
      hasMoreNewer.value = newHasMore;
      await readMetadata(items);
      unshiftMessages(...items);
    } finally {
      await onComplete();
    }
  };

  if (currentRoomId.value) {
    const roomId = currentRoomId.value;
    const route = useRoute();
    const rowKey = route.params.rowKey as string;
    const readMessagesWithRowKey = async () => {
      if (!rowKey) return false;

      const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({ roomId, rowKeys: [rowKey] });
      if (messagesByRowKeys.length === 0) return false;

      const response = await $trpc.message.readMessages.query({
        cursor: serialize({ rowKey: messagesByRowKeys[0].rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]),
        isIncludeValue: true,
        roomId,
      });
      await readMetadata(response.items);
      initializeCursorPaginationData(response);
      hasMoreNewer.value = true;
      nextCursorNewer.value = serialize({ rowKey: getReverseTickedTimestamp(rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]);
      return true;
    };

    if (!(await readMessagesWithRowKey())) {
      const response = await $trpc.message.readMessages.query({ roomId });
      await readMetadata(response.items);
      initializeCursorPaginationData(response);
    }
  }

  return { readMoreMessages, readMoreNewerMessages };
};
