import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";
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
      { partitionKey: currentRoomId },
      { onData: (data) => createMessage(data) }
    );
    updateMessageUnsubscribable = $client.message.onUpdateMessage.subscribe(
      { partitionKey: currentRoomId },
      { onData: (data) => updateMessage(data) }
    );
    deleteMessageUnsubscribable = $client.message.onDeleteMessage.subscribe(
      { partitionKey: currentRoomId },
      { onData: (data) => deleteMessage(data) }
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable?.unsubscribe();
    updateMessageUnsubscribable?.unsubscribe();
    deleteMessageUnsubscribable?.unsubscribe();
  });
};
