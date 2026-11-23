import type { ClientMessage } from "#src/models/message/ClientMessage";

import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { checkIsNewerThanCopy } from "#src/services/message/checkIsNewerThanCopy";
import { messageHolderRegistry } from "#src/services/message/messageHolderRegistry";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { updateMessageCopy } from "#src/services/message/updateMessageCopy";
import { createOperationData } from "#src/services/shared/createOperationData";
import { getInsertedItems } from "#src/services/shared/getInsertedItems";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<ClientMessage>(() => roomStore.currentRoomId);
  const dataStore = useDataStore();
  const { getSlice: getDataSlice } = dataStore;
  // The room pages its pins newest message first, by id, and a pin takes its place in that order. Editing a pin does
  // Not Move it, since the order is the room's and not the time of the last change to the message
  const placePin = (roomId: ClientMessage["roomId"], message: ClientMessage) => {
    const { items: roomItems } = getSlice(roomId);
    if (roomItems.value.some(({ id }) => id === message.id)) return;

    roomItems.value = getInsertedItems(roomItems.value, message, ({ id }) => id < message.id);
  };
  // The pinned list holds its own rows, since a pin read from the server reaches past the messages the room has loaded.
  // Each row takes the changes the room's messages take, so an edit or a deletion reaches the pane as it reaches the
  // Room
  messageHolderRegistry.register((roomId, hold) => {
    hold(getSlice(roomId).items.value);
  });
  // An answer older than the copy it would change is a late echo of a change already past, so it changes nothing here
  MessageHookMap[Operation.Update].register((input) => {
    const { deleteMessage } = createOperationData(getSlice(input.roomId).items, ["id"], DatabaseEntityType.Message);
    const pinnedMessage = getSlice(input.roomId).items.value.find(({ id }) => id === input.id);
    if ("isPinned" in input && !input.isPinned) {
      if (checkIsNewerThanCopy(pinnedMessage, input)) deleteMessage(input);
      return;
    }

    updateMessageCopy(pinnedMessage, input);
    if (!input.isPinned) return;

    // The source message is read from its own room's slice: `dataStore.items` is the room on screen, so a pin toggled
    // From A search result or a thread in another room would find nothing there. The window takes this update after the
    // Hooks, So the copy is the message with the pin applied to it, and a pin older than that copy places nothing
    const message = getDataSlice(input.roomId).items.value.find(
      getEntityIdEqualComparator<ClientMessage>(["id"], input),
    );
    if (message && checkIsNewerThanCopy(message, input)) placePin(input.roomId, { ...message, ...input });
  });
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.Message).deleteMessage({ id });
  });
  return { getSlice, items, ...restData };
});
