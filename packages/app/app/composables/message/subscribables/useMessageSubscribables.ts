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

  watchImmediate(
    currentRoomId,
    async (roomId) => {
      if (!roomId) return;

      const createMessageUnsubscribable = $trpc.message.onCreateMessage.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction(async ({ data }) => {
            for (const newMessage of data) await storeCreateMessage(newMessage);
          }),
        },
      );
      const updateMessageUnsubscribable = $trpc.message.onUpdateMessage.subscribe(
        { roomId },
        {
          onData: (data) => {
            storeUpdateMessage(data);
          },
        },
      );
      const deleteMessageUnsubscribable = $trpc.message.onDeleteMessage.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction(async (data) => {
            await storeDeleteMessage(data);
          }),
        },
      );
      const webPubSubClient = new WebPubSubClient({
        getClientAccessUrl: (options) =>
          $trpc.message.getWebPubSubClientAccessUrl.query(
            { roomId },
            { signal: options?.abortSignal as AbortSignal | undefined },
          ),
      });
      await webPubSubClient.start();
      webPubSubClient.on(
        "group-message",
        getSynchronizedFunction(async ({ message: { data } }) => {
          const entity = new WebhookMessageEntity(jsonDateParse(data as string));
          await storeCreateMessage(entity);
        }),
      );

      return () => {
        createMessageUnsubscribable.unsubscribe();
        updateMessageUnsubscribable.unsubscribe();
        deleteMessageUnsubscribable.unsubscribe();
        webPubSubClient.stop();
      };
    },
    { flush: "post" },
  );
};
