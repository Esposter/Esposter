import type { ClientMessage } from "#src/models/message/ClientMessage";

import { checkIsMessageId } from "#src/services/message/checkIsMessageId";
import { toRoomMessagePage } from "#src/services/message/message/toRoomMessagePage";
import { requirePartitionKey } from "#src/services/message/requirePartitionKey";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { getRouteParam } from "#src/util/router/getRouteParam";

export const useReadMessages = () => {
  const { currentRoute } = useRouter();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { getPreviousCursorRef, readItems, readMoreItems, readMoreNewerItems } = dataStore;
  const readMetadata = useReadMessageMetadata();
  // A page of a room's messages as the list holds it. A row names only its own id, so the room rides on each message
  const readRoomMessagePage = async (roomId: ClientMessage["roomId"], cursor: string) => {
    const page = await $trpc.message.readMessages.query({ cursor, roomId });
    const roomMessagePage = toRoomMessagePage(page, roomId);
    await readMetadata(roomId, roomMessagePage.items);
    return roomMessagePage;
  };

  const readMessages = () => {
    const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);
    // Written after an await, so the cursor names the room this read was issued for rather than the one the reader has
    // Open by the time it lands
    const previousCursor = getPreviousCursorRef(roomId);
    return readItems(async () => {
      // A route param is whatever the address bar holds, so one that is no message id reads as no message to open on
      const messageId = getRouteParam(currentRoute.value.params, "messageId");
      if (checkIsMessageId(messageId)) {
        // The room opens at the message and reads both ways from it. A message the room does not hold leaves the
        // Window around its id, so the window only counts when it holds the message itself
        const anchoredPage = await $trpc.message.readMessagesAround.query({ messageId: Number(messageId), roomId });
        if (anchoredPage.items.some(({ id }) => id === Number(messageId))) {
          const roomMessagePage = toRoomMessagePage(anchoredPage, roomId);
          await readMetadata(roomId, roomMessagePage.items);
          previousCursor.value = anchoredPage.previousCursor;
          return roomMessagePage;
        }
      }

      const page = await readRoomMessagePage(roomId, "");
      previousCursor.value = "";
      return page;
    });
  };

  const readMoreMessages = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreMessages.name);
    return readMoreItems((cursor) => readRoomMessagePage(roomId, cursor), onComplete);
  };

  const readMoreNewerMessages = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreNewerMessages.name);
    return readMoreNewerItems(roomId, (cursor) => readRoomMessagePage(roomId, cursor), onComplete);
  };

  return { readMessages, readMoreMessages, readMoreNewerMessages };
};
