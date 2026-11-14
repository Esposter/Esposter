import type { ClientMessage } from "@/models/message/ClientMessage";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { checkIsMessageId } from "@/services/message/checkIsMessageId";
import { checkIsNewerMessage } from "@/services/message/checkIsNewerMessage";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { toMessagePage } from "@/services/message/toMessagePage";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getRouteParam } from "@/util/router/getRouteParam";
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
      // A route param is whatever the address bar holds, so one that is no message id reads as no message to open on
      const messageId = getRouteParam(currentRoute.value.params, "messageId");
      if (checkIsMessageId(messageId)) {
        const [message] = await $trpc.message.readMessagesByIds.query({ messageIds: [Number(messageId)], roomId });
        if (message) {
          // A page older than the message, the message itself first: the newer side is not read, so it stays unloaded
          const page = toMessagePage(
            roomId,
            await $trpc.message.readMessages.query({ before: message.id + 1, roomId }),
          );
          hasMoreNewer.value = true;
          nextCursorNewer.value = String(message.id);
          await readMetadata(roomId, page.items);
          return page;
        }
      }

      const page = toMessagePage(roomId, await $trpc.message.readMessages.query({ roomId }));
      hasMoreNewer.value = false;
      nextCursorNewer.value = "";
      await readMetadata(roomId, page.items);
      return page;
    });
  };

  const readMoreMessages = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreMessages.name);
    return readMoreItems(async (cursor) => {
      const page = toMessagePage(roomId, await $trpc.message.readMessages.query({ before: Number(cursor), roomId }));
      await readMetadata(roomId, page.items);
      return page;
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

    const messageIds = new Set(items.map(({ id }) => id));
    const newerItems: ClientMessage[] = [];
    const olderItems: ClientMessage[] = [];

    for (const item of roomItems.value)
      if (!messageIds.has(item.id))
        if (items.length > 0 && checkIsNewerMessage(item, takeOne(items))) newerItems.push(item);
        else olderItems.push(item);

    roomItems.value = [...newerItems, ...items, ...olderItems];
    await readMetadata(roomId, items);
    onComplete();
  };

  return { readMessages, readMoreMessages, readMoreNewerMessages };
};
