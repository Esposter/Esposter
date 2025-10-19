import { dayjs } from "#shared/services/dayjs";
import { useDataStore } from "@/store/message/data";
import { useReplyStore } from "@/store/message/reply";
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";

export const useScrollToMessage = () => {
  const { $trpc } = useNuxtApp();
  const replyStore = useReplyStore();
  const { activeRowKey } = storeToRefs(replyStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  return async (rowKey: string) => {
    if (!currentRoomId.value) return;
    else if (!items.value.some((m) => m.rowKey === rowKey)) {
      const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
        roomId: currentRoomId.value,
        rowKeys: [rowKey],
      });
      if (messagesByRowKeys.length === 0) return;

      await navigateTo(RoutePath.MessagesMessage(currentRoomId.value, rowKey));
      return;
    }

    activeRowKey.value = rowKey;
    document.getElementById(rowKey)?.scrollIntoView();
    useTimeoutFn(() => {
      activeRowKey.value = undefined;
    }, dayjs.duration(2, "seconds").asMilliseconds());
  };
};
