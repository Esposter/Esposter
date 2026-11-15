import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { useScrollStore } from "#src/store/message/ui/scroll";
import { RoutePath } from "@esposter/shared";

export const useScrollToMessage = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const scrollStore = useScrollStore();
  const { setActiveMessageId } = scrollStore;
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  return async (roomId: string, messageId: number) => {
    if (roomId !== currentRoomId.value || !items.value.some((message) => message.id === messageId)) {
      await navigateTo(RoutePath.MessagesMessage(roomId, messageId));
      return;
    }

    setActiveMessageId(messageId);
    window.document.getElementById(`${messageId}`)?.scrollIntoView({ block: "center" });
  };
};
