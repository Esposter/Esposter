import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageInputMap = ref(new Map<string, string>());
  const messageInput = computed({
    get: () => {
      if (!currentRoomId.value) return "";
      return messageInputMap.value.get(currentRoomId.value) ?? "";
    },
    set: (newMessageInput) => {
      if (!currentRoomId.value) return;
      messageInputMap.value.set(currentRoomId.value, newMessageInput);
    },
  });
  return { messageInput };
});
