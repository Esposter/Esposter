import type { Unsubscribable } from "@trpc/server/observable";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { WebhookMessageEntity } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = dataStore;

  const createMessageUnsubscribable = ref<Unsubscribable>();
  const updateMessageUnsubscribable = ref<Unsubscribable>();
  const deleteMessageUnsubscribable = ref<Unsubscribable>();
  const webPubSubClient = ref<WebPubSubClient>();

  onMounted(async () => {
    if (!currentRoomId.value) return;

    const roomId = currentRoomId.value;
    createMessageUnsubscribable.value = $trpc.message.onCreateMessage.subscribe(
      { roomId },
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
    webPubSubClient.value = new WebPubSubClient({
      getClientAccessUrl: (options) =>
        $trpc.message.getWebPubSubClientAccessUrl.query(
          { roomId },
          { signal: options?.abortSignal as AbortSignal | undefined },
        ),
    });
    await webPubSubClient.value.start();
    webPubSubClient.value.on(
      "group-message",
      getSynchronizedFunction(async ({ message: { data } }) => {
        const entity = new WebhookMessageEntity(jsonDateParse(data as string));
        await storeCreateMessage(entity);
      }),
    );
  });

  onUnmounted(() => {
    createMessageUnsubscribable.value?.unsubscribe();
    updateMessageUnsubscribable.value?.unsubscribe();
    deleteMessageUnsubscribable.value?.unsubscribe();
    webPubSubClient.value?.stop();
  });
};
