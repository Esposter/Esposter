import type { MessageEntity } from "@esposter/db-schema";

import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const displayMessages = computed(() => items.value.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  const dataStore = useDataStore();
  // The pin belongs to the room the message is in, which is not necessarily the room on screen — a pin toggled
  // From a search result or a thread in another room writes that room's list, and `displayMessages` above only reads
  MessageHookMap[Operation.Update].register((input) => {
    if (!("isPinned" in input)) return;

    const { createMessage, deleteMessage } = createOperationData(
      getSlice(input.partitionKey).items,
      CompositeAzureKeyPath,
      AzureEntityType.Message,
    );
    if (input.isPinned) {
      // The source message is read from its own room's slice for the same reason the pin is written to one:
      // `dataStore.items` is the room on screen, so a pin toggled from elsewhere would find nothing there
      const message = dataStore
        .getSlice(input.partitionKey)
        .items.value.find(getEntityIdEqualComparator<MessageEntity>(CompositeAzureKeyPath, input));
      if (!message) return;

      createMessage(message);
    } else deleteMessage(input);
  });
  return {
    displayMessages,
    getSlice,
    ...restData,
  };
});
