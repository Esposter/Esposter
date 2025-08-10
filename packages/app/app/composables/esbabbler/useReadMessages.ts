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
  const { initializeCursorPaginationData, pushMessages, unshiftMessages: baseUnshiftMessages } = messageStore;
  const { hasMore, hasMoreNewer, messageContainerElement, nextCursor, nextCursorNewer } = storeToRefs(messageStore);
  // A bit of a workaround to prevent sticky scroll position when loading newer messages
  const unshiftMessages: typeof baseUnshiftMessages = async (...args) => {
    const previousScrollHeight = messageContainerElement.value?.scrollHeight ?? 0;
    baseUnshiftMessages(...args);
    await nextTick();
    if (messageContainerElement.value)
      messageContainerElement.value.scrollTop += messageContainerElement.value.scrollHeight - previousScrollHeight;
  };

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
  const readMoreNewerMessages = async (onComplete: () => void) => {
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
      onComplete();
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

      const messageByRowKey = messagesByRowKeys[0];
      const [older, newer] = await Promise.all([
        $trpc.message.readMessages.query({
          cursor: serialize({ rowKey: messageByRowKey.rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]),
          isIncludeValue: true,
          roomId,
        }),
        $trpc.message.readMessages.query({
          // We'll need to reverse the row key to get the older messages
          cursor: serialize({ rowKey: getReverseTickedTimestamp(messageByRowKey.rowKey) }, [MESSAGE_ROWKEY_SORT_ITEM]),
          order: SortOrder.Asc,
          roomId,
        }),
      ]);
      await readMetadata([...newer.items, ...older.items]);
      initializeCursorPaginationData(older);
      nextCursorNewer.value = newer.nextCursor;
      hasMoreNewer.value = newer.hasMore;
      unshiftMessages(...newer.items);
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
