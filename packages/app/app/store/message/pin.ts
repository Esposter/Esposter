import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { AzureEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const { createMessage, deleteMessage } = createOperationData(items, CompositeAzureKeyPath, AzureEntityType.Message);
  const messages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const dataStore = useDataStore();
  MessageHookMap[Operation.Update].register((input) => {
    if (!("isPinned" in input)) return;

    if (input.isPinned) {
      const message = dataStore.items.find((i) =>
        getIsEntityIdEqualComparator<MessageEntity>(CompositeAzureKeyPath, input)(i),
      );
      if (!message) return;
      createMessage(message);
    } else deleteMessage(input);
  });
  return {
    messages,
    ...restData,
  };
});
