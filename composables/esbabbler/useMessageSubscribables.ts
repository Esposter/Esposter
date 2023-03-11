import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";
import type { Unsubscribable } from "@trpc/server/observable";

export const useMessageSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { createMessage, updateMessage, deleteMessage } = messageStore;

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    createMessageUnsubscribable.value = $client.message.onCreateMessage.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => createMessage(data) }
    );
    updateMessageUnsubscribable.value = $client.message.onUpdateMessage.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => updateMessage(data) }
    );
    deleteMessageUnsubscribable.value = $client.message.onDeleteMessage.subscribe(
      { roomId: currentRoomId.value },
      { onData: (data) => deleteMessage(data) }
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
  });
};
