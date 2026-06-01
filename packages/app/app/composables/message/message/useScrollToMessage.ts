import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { useScrollStore } from "@/store/message/ui/scroll";
import { RoutePath } from "@esposter/shared";

export const useScrollToMessage = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const scrollStore = useScrollStore();
  const { setActiveRowKey } = scrollStore;
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  return async (roomId: string, rowKey: string) => {
    if (roomId !== currentRoomId.value || !items.value.some((message) => message.rowKey === rowKey)) {
      await navigateTo(RoutePath.MessagesMessage(roomId, rowKey));
      return;
    }

    setActiveRowKey(rowKey);
    window.document.getElementById(rowKey)?.scrollIntoView({ block: "center" });
  };
};
