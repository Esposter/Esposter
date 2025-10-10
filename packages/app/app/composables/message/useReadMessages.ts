import type { MessageEntity } from "@esposter/db";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getReverseTickedTimestamp, MessageEntityPropertyNames } from "@esposter/db";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadMessages = () => {
  const route = useRoute();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { readItems, readMoreItems } = dataStore;
  const { hasMoreNewer, nextCursorNewer } = storeToRefs(dataStore);
  const { unshiftMessages } = dataStore;
  const readUsers = useReadUsers();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  const readMetadata = async (messages: MessageEntity[]) => {
    await Promise.all([
      readUsers(messages.map(({ userId }) => userId)),
      readReplies([...new Set(messages.map(({ replyRowKey }) => replyRowKey).filter((value) => value !== undefined))]),
      readFiles(messages.flatMap(({ files }) => files)),
      readEmojis(messages.map(({ rowKey }) => rowKey)),
    ]);
  };

  const readMessages = () =>
    readItems(
      async () => {
        if (!currentRoomId.value)
          throw new InvalidOperationError(Operation.Read, readMessages.name, MessageEntityPropertyNames.partitionKey);
        const roomId = currentRoomId.value;
        const rowKey = route.params.rowKey as string | undefined;

        if (rowKey) {
          const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({ roomId, rowKeys: [rowKey] });
          if (messagesByRowKeys.length > 0) {
            const response = await $trpc.message.readMessages.useQuery({
              cursor: serialize({ rowKey: messagesByRowKeys[0].rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]),
              isIncludeValue: true,
              roomId,
            });
            hasMoreNewer.value = true;
            nextCursorNewer.value = serialize({ rowKey: getReverseTickedTimestamp(rowKey) }, [
              MESSAGE_ROWKEY_SORT_ITEM,
            ]);
            return response;
          }
        }

        const response = await $trpc.message.readMessages.useQuery({ roomId });
        hasMoreNewer.value = false;
        nextCursorNewer.value = undefined;
        return response;
      },
      ({ items }) => readMetadata(items),
    );

  const readMoreMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(Operation.Read, readMessages.name, MessageEntityPropertyNames.partitionKey);
      const response = await $trpc.message.readMessages.query({ cursor, roomId: currentRoomId.value });
      await readMetadata(response.items);
      return response;
    }, onComplete);

  const readMoreNewerMessages = async (onComplete: () => void) => {
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
    hasMoreNewer.value = newHasMore;
    nextCursorNewer.value = newNextCursor;
    unshiftMessages(...items);
    await readMetadata(items);
    onComplete();
  };

  return { readMessages, readMoreMessages, readMoreNewerMessages };
};
