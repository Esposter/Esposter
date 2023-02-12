import { useRoomStore } from "@/store/chat/useRoomStore";

export const useMessageInputStore = defineStore("chat/messageInput", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));

  const messageInputMap = ref<Record<string, string>>({});
  const messageInput = computed(() => {
    if (!currentRoomId || !messageInputMap.value[currentRoomId]) return "";
    return messageInputMap.value[currentRoomId];
  });
  const updateMessageInput = (updatedMessageInput: string) => {
    if (!currentRoomId) return;
    messageInputMap.value[currentRoomId] = updatedMessageInput;
  };
  return { messageInput, updateMessageInput };
});
