import type { MessageEntity } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { MessageType, StandardMessageEntity, WebhookMessageEntity } from "@esposter/db-schema";
import { getResultAsync, jsonDateParse, noop } from "@esposter/shared";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = dataStore;
  const readMembersByIds = useReadMembersByIds();

  useOnlineSubscribable(currentRoomId, async (roomId) => {
    if (!roomId) return undefined;

    const createMessageUnsubscribable = $trpc.message.onCreateMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(({ data }) =>
          getResultAsync(async () => {
            // Existing members who joined in a previous session won't fire onJoinRoom
            // So we need to ensure their data is loaded for author info on new messages
            const userIds = Array.from(new Set(data), ({ userId }) => userId).filter((userId) => userId !== undefined);
            if (userIds.length > 0) await readMembersByIds(userIds);
            for (const newMessage of data) await storeCreateMessage(newMessage);
          }).match(noop, console.error),
        ),
      },
    );
    const updateMessageUnsubscribable = $trpc.message.onUpdateMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction((updatedMessage) =>
          getResultAsync(() => storeUpdateMessage(updatedMessage)).match(noop, console.error),
        ),
      },
    );
    const deleteMessageUnsubscribable = $trpc.message.onDeleteMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction((deleteInput) =>
          getResultAsync(() => storeDeleteMessage(deleteInput)).match(noop, console.error),
        ),
      },
    );
    const webPubSubClient = new WebPubSubClient({
      getClientAccessUrl: (options) =>
        $trpc.message.generateWebPubSubClientAccessUrl.query(
          { roomId },
          { signal: options?.abortSignal as AbortSignal | undefined },
        ),
    });
    await webPubSubClient.start();
    webPubSubClient.on(
      "group-message",
      getSynchronizedFunction(({ message: { data } }) =>
        getResultAsync(async () => {
          // Data arrives as a pre-parsed object (dataType: "json") from WebPubSub — re-stringify so
          // JsonDateParse can revive ISO date strings back to Date instances
          const parsedData = jsonDateParse<MessageEntity>(JSON.stringify(data));
          const entity =
            parsedData.type === MessageType.Webhook
              ? new WebhookMessageEntity(parsedData)
              : new StandardMessageEntity(parsedData);
          await storeCreateMessage(entity);
        }).match(noop, console.error),
      ),
    );

    return () => {
      createMessageUnsubscribable.unsubscribe();
      updateMessageUnsubscribable.unsubscribe();
      deleteMessageUnsubscribable.unsubscribe();
      webPubSubClient.stop();
    };
  });
};
