import type { ClientMessage } from "@/models/message/ClientMessage";

import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { messageHolderRegistry } from "@/services/message/messageHolderRegistry";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { getInsertedItems } from "@/services/shared/getInsertedItems";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<ClientMessage>(() => roomStore.currentRoomId);
  const dataStore = useDataStore();
  const { getSlice: getDataSlice } = dataStore;
  // The room pages its pins newest message first, by id, and a pin takes its place in that order. Editing a pin does not
  // Move it, since the order is the room's and not the time of the last change to the message
  const placePin = (roomId: ClientMessage["roomId"], message: ClientMessage) => {
    const { items: roomItems } = getSlice(roomId);
    if (roomItems.value.some(({ id }) => id === message.id)) return;

    roomItems.value = getInsertedItems(roomItems.value, message, ({ id }) => id < message.id);
  };
  // The pinned list holds its own rows, since a pin read from the server reaches past the messages the room has loaded.
  // Each row takes the changes the room's messages take, so an edit or a deletion reaches the pane as it reaches the room
  messageHolderRegistry.register((roomId, hold) => {
    hold(getSlice(roomId).items.value);
  });
  MessageHookMap[Operation.Update].register((input) => {
    const { deleteMessage, updateMessage } = createOperationData(
      getSlice(input.roomId).items,
      ["id"],
      DatabaseEntityType.Message,
    );
    if ("isPinned" in input && !input.isPinned) {
      deleteMessage(input);
      return;
    }

    updateMessage(input);
    if (!input.isPinned) return;

    // The source message is read from its own room's slice: `dataStore.items` is the room on screen, so a pin toggled from
    // A search result or a thread in another room would find nothing there. The window takes this update after the hooks,
    // So the copy is the message with the pin applied to it
    const message = getDataSlice(input.roomId).items.value.find(
      getEntityIdEqualComparator<ClientMessage>(["id"], input),
    );
    if (message) placePin(input.roomId, { ...message, ...input });
  });
  MessageHookMap[Operation.Delete].register(({ id, roomId }) => {
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.Message).deleteMessage({ id });
  });
  return { getSlice, items, ...restData };
});
