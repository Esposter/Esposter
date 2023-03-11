import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
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
  return { messageInput };
});
