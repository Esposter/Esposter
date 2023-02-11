import { useRoomStore } from "@/store/chat/useRoomStore";

export const useMessageInputStore = defineStore("chat/messageInput", () => {
  const roomStore = useRoomStore();
  const messageInputMap = ref<Record<string, string>>({});
  const messageInput = computed(() => {
    if (!roomStore.currentRoomId || !messageInputMap.value[roomStore.currentRoomId]) return "";
    return messageInputMap.value[roomStore.currentRoomId];
  });
  const updateMessageInput = (updatedMessageInput: string) => {
    if (!roomStore.currentRoomId) return;
    messageInputMap.value[roomStore.currentRoomId] = updatedMessageInput;
  };
  return { messageInput, updateMessageInput };
});
