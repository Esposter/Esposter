import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
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

  onMounted(() => {
    if (!currentRoomId.value) return;

    const roomId = currentRoomId.value;
    createMessageUnsubscribable.value = $trpc.message.onCreateMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async (data) => {
          await storeCreateMessage(data);
        }),
      },
    );
    updateMessageUnsubscribable.value = $trpc.message.onUpdateMessage.subscribe(
      { roomId },
      {
        onData: (data) => {
          storeUpdateMessage(data);
        },
      },
    );
    deleteMessageUnsubscribable.value = $trpc.message.onDeleteMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async (data) => {
          await storeDeleteMessage(data);
        }),
      },
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
  });
};
