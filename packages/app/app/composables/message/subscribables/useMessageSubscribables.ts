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
  const readMembersByIds = useReadMembersByIds();

  useOnlineSubscribable(currentRoomId, async (roomId) => {
    if (!roomId) return undefined;

    const createMessageUnsubscribable = $trpc.message.onCreateMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async ({ data }) => {
          // Existing members who joined in a previous session won't fire onJoinRoom
          // So we need to ensure their data is loaded for author info on new messages
          const userIds = Array.from(new Set(data), ({ userId }) => userId).filter((userId) => userId !== undefined);
          if (userIds.length > 0) await readMembersByIds(userIds);
          for (const newMessage of data) await storeCreateMessage(newMessage);
        }),
      },
    );
    const updateMessageUnsubscribable = $trpc.message.onUpdateMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async (updatedMessage) => {
          await storeUpdateMessage(updatedMessage);
        }),
      },
    );
    const deleteMessageUnsubscribable = $trpc.message.onDeleteMessage.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async (deleteInput) => {
          await storeDeleteMessage(deleteInput);
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
  });
};
