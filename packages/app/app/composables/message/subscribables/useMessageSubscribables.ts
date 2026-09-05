import type { MessageEntity } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
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
            // A member who joined in a previous session fires no onJoinRoom, so their data is loaded here for
            // The author info a new message needs
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
    const stopWebPubSubClient = await useWebPubSubClient(
      (signal) => $trpc.message.generateWebPubSubClientAccessUrl.query({ roomId }, { signal }),
      getSynchronizedFunction(({ message: { data } }) =>
        getResultAsync(async () => {
          // Data arrives as a pre-parsed object (dataType: "json") from WebPubSub — re-stringify so
          // `jsonDateParse` can revive ISO date strings back to Date instances
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
      stopWebPubSubClient();
    };
  });
};
