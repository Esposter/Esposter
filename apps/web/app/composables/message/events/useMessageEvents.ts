import { getDistinctIds } from "#src/services/message/getDistinctIds";
import { useDataStore } from "#src/store/message/data";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useMessageEvents = () => {
  const dataStore = useDataStore();
  const { storeCreateMessage, storeDeleteMessage, storeUpdateMessage } = dataStore;
  const readUsersByIds = useReadUsersByIds();
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  onScopeDispose(
    onRoomEvent(
      "createMessage",
      getSynchronizedFunction((data, roomId) =>
        getResultAsync(async () => {
          // A member who joined in a previous session fires no onJoinRoom, so their data is loaded here for
          // The author info a new message needs
          const userIds = getDistinctIds(data.map(({ userId }) => userId));
          // A failed lookup only leaves its author unnamed, so the messages still land
          if (userIds.length > 0)
            await getResultAsync(() => readUsersByIds(roomId, userIds)).match(noop, console.error);
          // Each message is its own unit: one whose Create hooks reject stays out of the list and is logged, and the
          // Rest of the batch still lands behind it
          for (const newMessage of data)
            // oxlint-disable-next-line no-await-in-loop -- Order is the contract: messages enter the list in the order they were sent
            await getResultAsync(() => storeCreateMessage({ ...newMessage, roomId })).match(noop, console.error);
        }).match(noop, console.error),
      ),
    ),
  );
  onScopeDispose(
    onRoomEvent(
      "updateMessage",
      getSynchronizedFunction((updatedMessage, roomId) =>
        getResultAsync(() => storeUpdateMessage({ ...updatedMessage, roomId })).match(noop, console.error),
      ),
    ),
  );
  onScopeDispose(
    onRoomEvent(
      "deleteMessage",
      getSynchronizedFunction((deletedMessage, roomId) =>
        getResultAsync(() => storeDeleteMessage({ ...deletedMessage, roomId })).match(noop, console.error),
      ),
    ),
  );
};
