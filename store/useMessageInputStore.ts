import { useRoomStore } from "@/store/useRoomStore";
import { defineStore } from "pinia";

export const useMessageInputStore = defineStore("messageInput", () => {
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
