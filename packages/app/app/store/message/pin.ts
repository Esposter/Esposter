import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { AzureEntityType } from "#shared/models/azure/table/AzureEntityType";
import { dayjs } from "#shared/services/dayjs";
import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { Operation } from "@esposter/shared";

export const usePinStore = defineStore("message/pin", () => {
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const { createMessage, deleteMessage } = createOperationData(
    items,
    ["partitionKey", "rowKey"],
    AzureEntityType.Message,
  );
  const messages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const dataStore = useDataStore();
  MessageHookMap[Operation.Update].push((input) => {
    if (!("isPinned" in input)) return;

    if (input.isPinned) {
      const message = dataStore.items.find((i) => getIsEntityIdEqualComparator(["partitionKey", "rowKey"], input)(i));
      if (!message) return;
      createMessage(message);
    } else deleteMessage(input);
  });
  return {
    messages,
    ...rest,
  };
});
