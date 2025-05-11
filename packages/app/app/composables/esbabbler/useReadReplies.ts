import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadReplies = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { replyMap } = storeToRefs(messageStore);
  return async (replyRowKeys: string[]) => {
    if (!currentRoomId.value || replyRowKeys.length === 0) return;

    const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
      roomId: currentRoomId.value,
      rowKeys: replyRowKeys,
    });
    for (const messageByRowKey of messagesByRowKeys) replyMap.value.set(messageByRowKey.rowKey, messageByRowKey);
  };
};
