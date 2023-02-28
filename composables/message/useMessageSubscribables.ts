import { useMessageStore } from "@/store/chat/message";
import { useRoomStore } from "@/store/chat/room";
import type { Unsubscribable } from "@trpc/server/observable";

export const useMessageSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  const messageStore = useMessageStore();
  const { createMessage, updateMessage, deleteMessage } = messageStore;

  let createMessageUnsubscribable = $ref<Unsubscribable>();
  let updateMessageUnsubscribable = $ref<Unsubscribable>();
  let deleteMessageUnsubscribable = $ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId) return;

    createMessageUnsubscribable = $client.message.onCreateMessage.subscribe(
      { roomId: currentRoomId },
      { onData: (data) => createMessage(data) }
    );
    updateMessageUnsubscribable = $client.message.onUpdateMessage.subscribe(
      { roomId: currentRoomId },
      { onData: (data) => updateMessage(data) }
    );
    deleteMessageUnsubscribable = $client.message.onDeleteMessage.subscribe(
      { roomId: currentRoomId },
      { onData: (data) => deleteMessage(data) }
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable?.unsubscribe();
    updateMessageUnsubscribable?.unsubscribe();
    deleteMessageUnsubscribable?.unsubscribe();
  });
};
