import type { MessageEntity } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MESSAGE_ROW_KEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { getReverseTickedTimestamp } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

export const useReadMessages = () => {
  const { currentRoute } = useRouter();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { getHasMoreNewerRef, getNextCursorNewerRef, getSlice, readItems, readMoreItems } = dataStore;
  const readMetadata = useReadMessageMetadata();

  const readMessages = () => {
    const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);
    // Both are written after an await, so they name the room this read was issued for rather than the one the
    // Reader has open by the time it lands
    const hasMoreNewer = getHasMoreNewerRef(roomId);
    const nextCursorNewer = getNextCursorNewerRef(roomId);
    return readItems(async () => {
      const rowKey = getRouteParamString(currentRoute.value.params.rowKey);
      if (rowKey) {
        const messages = await $trpc.message.readMessagesByRowKeys.query({ roomId, rowKeys: [rowKey] });
        if (messages.length > 0) {
          const cursorPaginationData = await $trpc.message.readMessages.query({
            cursor: serialize({ rowKey: takeOne(messages).rowKey }, [MESSAGE_ROW_KEY_SORT_ITEM]),
            isIncludeValue: true,
            roomId,
          });
          hasMoreNewer.value = true;
          nextCursorNewer.value = serialize({ rowKey: getReverseTickedTimestamp(rowKey) }, [MESSAGE_ROW_KEY_SORT_ITEM]);
          await readMetadata(roomId, cursorPaginationData.items);
          return cursorPaginationData;
        }
      }

      const cursorPaginationData = await $trpc.message.readMessages.query({ roomId });
      hasMoreNewer.value = false;
      nextCursorNewer.value = "";
      await readMetadata(roomId, cursorPaginationData.items);
      return cursorPaginationData;
    });
  };

  const readMoreMessages = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreMessages.name);
    return readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.message.readMessages.query({ cursor, roomId });
      await readMetadata(roomId, cursorPaginationData.items);
      return cursorPaginationData;
    }, onComplete);
  };

  const readMoreNewerMessages = async (onComplete: () => void) => {
    if (!currentRoomId.value) return;
    // The room this page was read for, resolved before the request goes out — the reader can open another room
    // While it is in flight, and the page and its cursor belong to the room that asked for them either way
    const roomId = currentRoomId.value;
    const { items: roomItems } = getSlice(roomId);
    const hasMoreNewer = getHasMoreNewerRef(roomId);
    const nextCursorNewer = getNextCursorNewerRef(roomId);
    const { hasMore, items, nextCursor } = await $trpc.message.readMessages.query({
      cursor: nextCursorNewer.value,
      order: SortOrder.Asc,
      roomId,
    });
    hasMoreNewer.value = hasMore;
    nextCursorNewer.value = nextCursor ?? "";

    const rowKeys = new Set(items.map((item) => item.rowKey));
    const newerItems: MessageEntity[] = [];
    const olderItems: MessageEntity[] = [];

    for (const item of roomItems.value)
      if (!rowKeys.has(item.rowKey))
        if (items.length > 0 && item.rowKey < takeOne(items).rowKey) newerItems.push(item);
        else olderItems.push(item);

    roomItems.value = [...newerItems, ...items, ...olderItems];
    await readMetadata(roomId, items);
    onComplete();
  };

  return { readMessages, readMoreMessages, readMoreNewerMessages };
};
