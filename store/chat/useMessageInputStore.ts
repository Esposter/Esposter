import { useRoomStore } from "@/store/chat/useRoomStore";

export const useMessageInputStore = defineStore("chat/messageInput", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);

  const messageInputMap = ref<Record<string, string>>({});
  const messageInput = computed({
    get: () => {
      if (!currentRoomId.value || !messageInputMap.value[currentRoomId.value]) return "";
      return messageInputMap.value[currentRoomId.value];
    },
    set: (newMessageInput) => {
      if (!currentRoomId.value) return;
      messageInputMap.value[currentRoomId.value] = newMessageInput;
    },
  });
  const initialiseMessageInput = () => {
    messageInput.value = "";
  };
  return { messageInput, initialiseMessageInput };
});
