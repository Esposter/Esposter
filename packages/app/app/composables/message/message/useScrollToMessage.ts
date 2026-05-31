import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useScrollStore } from "@/store/message/ui/scroll";
import { RoutePath } from "@esposter/shared";

interface MessageScrollTarget {
  roomId?: string;
  rowKey: string;
}

export const useScrollToMessage = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const scrollStore = useScrollStore();
  const { setActiveRowKey } = scrollStore;
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const readTargetMessage = async (roomId: string, rowKey: string) => {
    const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({
      roomId,
      rowKeys: [rowKey],
    });
    return messagesByRowKeys.length > 0;
  };
  return async (target: string | MessageScrollTarget) => {
    const rowKey = typeof target === "string" ? target : target.rowKey;
    const roomId = typeof target === "string" ? currentRoomId.value : (target.roomId ?? currentRoomId.value);
    if (!roomId) return;
    else if (roomId !== currentRoomId.value || !items.value.some((message) => message.rowKey === rowKey)) {
      const doesMessageExist = await readTargetMessage(roomId, rowKey);
      if (!doesMessageExist) return;

      await navigateTo(RoutePath.MessagesMessage(roomId, rowKey));
      return;
    }

    setActiveRowKey(rowKey);
    window.document.getElementById(rowKey)?.scrollIntoView({ block: "center" });
  };
};
