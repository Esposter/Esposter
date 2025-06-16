import type { Unsubscribable } from "@trpc/server/observable";
import type { PushSubscription } from "web-push";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";
import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = messageStore;
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
  };

  const { trigger } = watchTriggerable(pushSubscription, (newPushSubscription) => {
    unsubscribe();

    if (!currentRoomId.value) return;

    const roomId = currentRoomId.value;
    createMessageUnsubscribable.value = $trpc.message.onCreateMessage.subscribe(
      {
        pushSubscription: newPushSubscription as unknown as PushSubscription,
        roomId,
      },
      {
        onData: getSynchronizedFunction(async ({ data }) => {
          for (const newMessage of data) await storeCreateMessage(newMessage);
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

  onMounted(() => {
    trigger();
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
