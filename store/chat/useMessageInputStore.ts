import { useRoomStore } from "@/store/chat/useRoomStore";

export const useMessageInputStore = defineStore("chat/messageInput", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));

  const messageInputMap = ref<Record<string, string>>({});
  const messageInput = computed({
    get: () => {
      if (!currentRoomId || !messageInputMap.value[currentRoomId]) return "";
      return messageInputMap.value[currentRoomId];
    },
    set: (newMessageInput) => {
      if (!currentRoomId) return;
      messageInputMap.value[currentRoomId] = newMessageInput;
    },
  });
  const updateMessageInput = (updatedMessageInput: string) => {
    messageInput.value = updatedMessageInput;
  };
  return { messageInput, updateMessageInput };
});
