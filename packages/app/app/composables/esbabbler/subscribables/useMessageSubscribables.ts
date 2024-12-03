import type { DeleteMessageInput } from "#shared/models/esbabbler/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/esbabbler/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/esbabbler/message/UpdateMessageInput";
import type { Unsubscribable } from "@trpc/server/observable";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageSubscribables = () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = messageStore;

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();

  onMounted(() => {
    if (!currentRoomId.value) return;

    createMessageUnsubscribable.value = $client.message.onCreateMessage.subscribe(
      { roomId: currentRoomId.value },
      {
        // @TODO: trpc-nuxt type issue
        onData: (data: MessageEntity) => {
          storeCreateMessage(data);
        },
      },
    );
    updateMessageUnsubscribable.value = $client.message.onUpdateMessage.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: UpdateMessageInput) => {
          storeUpdateMessage(data);
        },
      },
    );
    deleteMessageUnsubscribable.value = $client.message.onDeleteMessage.subscribe(
      { roomId: currentRoomId.value },
      {
        onData: (data: DeleteMessageInput) => {
          storeDeleteMessage(data);
        },
      },
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
  });
};
