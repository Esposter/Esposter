import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const messageInputMap = ref(new Map<string, string>());
  const messageInput = computed({
    get: () => {
      if (!roomStore.currentRoomId) return "";
      return messageInputMap.value.get(roomStore.currentRoomId) ?? "";
    },
    set: (newMessageInput) => {
      if (!roomStore.currentRoomId) return;
      messageInputMap.value.set(roomStore.currentRoomId, newMessageInput);
    },
  });
  const reply = ref<MessageEntity>();
  return { messageInput, reply };
});
