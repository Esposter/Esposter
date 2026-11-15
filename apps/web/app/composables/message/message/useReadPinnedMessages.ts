import { toRoomMessagePage } from "@/services/message/message/toRoomMessagePage";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { usePinStore } from "@/store/message/pin";
import { useRoomStore } from "@/store/message/room";

export const useReadPinnedMessages = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const pinStore = usePinStore();
  const { readItems, readMoreItems } = pinStore;
  const { $trpc } = useNuxtApp();
  // A page of the room's pinned messages, with the room on each message since a row names only its own id
  const readPinnedPage = async (roomId: string, cursor: string) => {
    const page = await $trpc.message.readMessages.query({ cursor, filter: { isPinned: true }, roomId });
    return toRoomMessagePage(page, roomId);
  };
  const readPinnedMessages = () => {
    const roomId = requirePartitionKey(currentRoomId.value, readPinnedMessages.name);
    return readItems(() => readPinnedPage(roomId, ""));
  };
  const readMorePinnedMessages = (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMorePinnedMessages.name);
    return readMoreItems((cursor) => readPinnedPage(roomId, cursor), onComplete);
  };
  return { readMorePinnedMessages, readPinnedMessages };
};
