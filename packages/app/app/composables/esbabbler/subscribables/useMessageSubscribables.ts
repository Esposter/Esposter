import type { Unsubscribable } from "@trpc/server/observable";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = messageStore;

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
  };

  watch(currentRoomId, (newRoomId, oldRoomId) => {
    if (oldRoomId) unsubscribe();
    if (!newRoomId) return;

    createMessageUnsubscribable.value = $trpc.message.onCreateMessage.subscribe(
      { roomId: newRoomId },
      {
        onData: (data) => {
          storeCreateMessage(data);
        },
      },
    );
    updateMessageUnsubscribable.value = $trpc.message.onUpdateMessage.subscribe(
      { roomId: newRoomId },
      {
        onData: (data) => {
          storeUpdateMessage(data);
        },
      },
    );
    deleteMessageUnsubscribable.value = $trpc.message.onDeleteMessage.subscribe(
      { roomId: newRoomId },
      {
        onData: (data) => {
          storeDeleteMessage(data);
        },
      },
    );
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
