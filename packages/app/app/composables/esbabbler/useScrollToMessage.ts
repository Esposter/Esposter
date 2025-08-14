import { RoutePath } from "#shared/models/router/RoutePath";
import { dayjs } from "#shared/services/dayjs";
import { useMessageStore } from "@/store/esbabbler/message";
import { useReplyStore } from "@/store/esbabbler/reply";
import { useRoomStore } from "@/store/esbabbler/room";

export const useScrollToMessage = () => {
  const { $trpc } = useNuxtApp();
  const replyStore = useReplyStore();
  const { activeRowKey } = storeToRefs(replyStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { messages } = storeToRefs(messageStore);
  return async (rowKey: string) => {
    if (!currentRoomId.value) return;
    else if (!messages.value.some((m) => m.rowKey === rowKey)) {
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
