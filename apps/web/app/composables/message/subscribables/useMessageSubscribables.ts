import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useMessageSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = dataStore;
  const readUsersByIds = useReadUsersByIds();

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    const unsubscribe = getUnsubscribe(
      $trpc.message.onCreateMessage.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction(({ data }) =>
            getResultAsync(async () => {
              // A member who joined in a previous session fires no onJoinRoom, so their data is loaded here for
              // The author info a new message needs
              const userIds = Array.from(new Set(data), ({ userId }) => userId).filter(
                (userId) => userId !== undefined,
              );
              if (userIds.length > 0) await readUsersByIds(roomId, userIds);
              // Each message is its own unit: one whose Create hooks reject stays out of the list and is logged, and the
              // Rest of the batch still lands behind it
              for (const newMessage of data)
                // oxlint-disable-next-line no-await-in-loop -- Order is the contract: messages enter the list in the order they were sent
                await getResultAsync(() => storeCreateMessage(newMessage)).match(noop, console.error);
            }).match(noop, console.error),
          ),
        },
      ),
      $trpc.message.onUpdateMessage.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction((updatedMessage) =>
            getResultAsync(() => storeUpdateMessage(updatedMessage)).match(noop, console.error),
          ),
        },
      ),
      $trpc.message.onDeleteMessage.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction((deleteInput) =>
            getResultAsync(() => storeDeleteMessage(deleteInput)).match(noop, console.error),
          ),
        },
      ),
    );

    return unsubscribe;
  });
};
