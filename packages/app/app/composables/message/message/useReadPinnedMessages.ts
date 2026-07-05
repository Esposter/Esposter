import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { usePinStore } from "@/store/message/pin";
import { useRoomStore } from "@/store/message/room";

export const useReadPinnedMessages = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const pinStore = usePinStore();
  const { readItems, readMoreItems } = pinStore;
  const { $trpc } = useNuxtApp();
  const readPinnedMessages = () =>
    readItems(() => {
      const roomId = requirePartitionKey(currentRoomId.value, readPinnedMessages.name);
      return $trpc.message.readMessages.query({ filter: { isPinned: true }, roomId });
    });
  const readMorePinnedMessages = () =>
    readMoreItems((cursor) => {
      const roomId = requirePartitionKey(currentRoomId.value, readMorePinnedMessages.name);
      return $trpc.message.readMessages.query({ cursor, filter: { isPinned: true }, roomId });
    });
  return { readMorePinnedMessages, readPinnedMessages };
};
