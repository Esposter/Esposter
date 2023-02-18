import { useRoomStore } from "@/store/chat/useRoomStore";
import DOMPurify from "dompurify";

interface MessageInput {
  html: string;
  text: string;
}

export const useMessageInputStore = defineStore("chat/messageInput", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);

  const messageInputMap = ref<Record<string, MessageInput>>({});
  const messageInput = computed({
    get: () => {
      if (!currentRoomId.value || !messageInputMap.value[currentRoomId.value]) return { html: "", text: "" };
      const messageInput = messageInputMap.value[currentRoomId.value];
      return { ...messageInput, html: DOMPurify.sanitize(messageInput.html) };
    },
    set: (newMessageInput) => {
      if (!currentRoomId.value) return;
      messageInputMap.value[currentRoomId.value] = newMessageInput;
    },
  });
  const messageInputHtml = computed({
    get: () => messageInput.value.html,
    set: (newMessageInputHtml) => {
      messageInput.value = { ...messageInput.value, html: newMessageInputHtml };
    },
  });
  const messageInputText = computed({
    get: () => messageInput.value.text,
    set: (newMessageInputText) => {
      messageInput.value = { ...messageInput.value, text: newMessageInputText };
    },
  });
  const initialiseMessageInput = () => {
    messageInput.value = { html: "", text: "" };
  };
  return { messageInputHtml, messageInputText, initialiseMessageInput };
});
