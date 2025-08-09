import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
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
      // We are given Oldest -> Newest based on our sortBy
      // but we want Newest -> Oldest to unshift and maintain [newestMessage, ...]
      unshiftMessages(...items.toReversed());
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const route = useRoute();
    const rowKey = route.params.rowKey as string;
    if (rowKey) {
      const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
        roomId: currentRoomId.value,
        rowKeys: [rowKey],
      });
      if (messagesByRowKeys.length > 0) {
        const [older, newer] = await Promise.all([
          $trpc.message.readMessages.query({ cursor: rowKey, roomId: currentRoomId.value }),
          $trpc.message.readMessages.query({
            cursor: rowKey,
            isIncludeValue: true,
            order: SortOrder.Asc,
            roomId: currentRoomId.value,
          }),
        ]);
        const newerItems = newer.items.toReversed();
        const items = [...older.items, ...newerItems];
        await readMetadata(items);
        initializeCursorPaginationData(older);
        nextCursorNewer.value = newer.nextCursor;
        hasMoreNewer.value = newer.hasMore;
        unshiftMessages(...newerItems);
        return;
      }
    }

    const response = await $trpc.message.readMessages.query({ roomId: currentRoomId.value });
    await readMetadata(response.items);
    initializeCursorPaginationData(response);
  }

  return { readMoreMessages, readMoreNewerMessages };
};
