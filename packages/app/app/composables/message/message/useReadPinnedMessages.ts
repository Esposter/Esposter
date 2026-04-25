import { usePinStore } from "@/store/message/pin";
import { useRoomStore } from "@/store/message/room";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadPinnedMessages = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const pinStore = usePinStore();
  const { readItems, readMoreItems } = pinStore;
  const { $trpc } = useNuxtApp();
  const readPinnedMessages = () =>
    readItems(() => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readPinnedMessages.name,
          CompositeKeyPropertyNames.partitionKey,
        );
      return $trpc.message.readMessages.query({ filter: { isPinned: true }, roomId: currentRoomId.value });
    });
  const readMorePinnedMessages = () =>
    readMoreItems((cursor) => {
      if (!currentRoomId.value)
        throw new InvalidOperationError(
          Operation.Read,
          readMorePinnedMessages.name,
          CompositeKeyPropertyNames.partitionKey,
        );
      return $trpc.message.readMessages.query({ cursor, filter: { isPinned: true }, roomId: currentRoomId.value });
    });
  return { readMorePinnedMessages, readPinnedMessages };
};
