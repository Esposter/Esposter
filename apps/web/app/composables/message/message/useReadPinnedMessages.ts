import { toRoomMessagePage } from "#src/services/message/message/toRoomMessagePage";
import { requirePartitionKey } from "#src/services/message/requirePartitionKey";
import { usePinStore } from "#src/store/message/pin";
import { useRoomStore } from "#src/store/message/room/index";

export const useReadPinnedMessages = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const pinStore = usePinStore();
  const { readItems, readMoreItems } = pinStore;
  const { $trpc } = useNuxtApp();
  const readMetadata = useReadMessageMetadata();
  // A page of the room's pinned messages, with the room on each message since a row names only its own id. Its authors,
  // Replies and reactions are read with it, as the room's messages are, so a pinned row renders them
  const readPinnedPage = async (roomId: string, cursor: string) => {
    const page = await $trpc.message.readMessages.query({ cursor, filter: { isPinned: true }, roomId });
    const roomMessagePage = toRoomMessagePage(page, roomId);
    await readMetadata(roomId, roomMessagePage.items);
    return roomMessagePage;
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
