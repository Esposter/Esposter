import type { Unsubscribable } from "@trpc/server/observable";
import type { PushSubscription } from "web-push";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { usePushSubscriptionStore } from "@/store/pushSubscription";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { WebhookMessageEntity } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = dataStore;
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();
  const webPubSubClient = ref<WebPubSubClient>();

  const unsubscribe = () => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
    webPubSubClient.value?.stop();
    webPubSubClient.value = undefined;
  };

  const { trigger } = watchTriggerable(pushSubscription, async (newPushSubscription) => {
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
    const clientAccessUrl = await $trpc.message.getWebPubSubClientAccessUrl.query({ roomId });
    webPubSubClient.value = new WebPubSubClient(clientAccessUrl);
    await webPubSubClient.value.start();
    await webPubSubClient.value.joinGroup(roomId);
    webPubSubClient.value.on(
      "group-message",
      getSynchronizedFunction(async ({ message: { data } }) => {
        const entity = new WebhookMessageEntity(jsonDateParse(data as string));
        await storeCreateMessage(entity);
      }),
    );
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
