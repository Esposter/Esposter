import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { getIsEntityIdEqualComparator } from "@/services/entity/getIsEntityIdEqualComparator";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const messages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const dataStore = useDataStore();
  // The pin belongs to the room the message is in, which is not necessarily the room on screen — a pin toggled
  // From a search result or a thread in another room writes that room's list, and `messages` above only reads
  MessageHookMap[Operation.Update].register((input) => {
    if (!("isPinned" in input)) return;

    const { createMessage, deleteMessage } = createOperationData(
      getSlice(input.partitionKey).items,
      CompositeAzureKeyPath,
      AzureEntityType.Message,
    );
    if (input.isPinned) {
      const message = dataStore.items.find(getIsEntityIdEqualComparator<MessageEntity>(CompositeAzureKeyPath, input));
      if (!message) return;

      createMessage(message);
    } else deleteMessage(input);
  });
  return {
    getSlice,
    messages,
    ...restData,
  };
});
