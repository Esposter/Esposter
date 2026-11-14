import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { toMessagePage } from "@/services/message/toMessagePage";
import { usePinStore } from "@/store/message/pin";
import { useRoomStore } from "@/store/message/room";

export const useReadPinnedMessages = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const pinStore = usePinStore();
  const { readItems, readMoreItems } = pinStore;
  const { $trpc } = useNuxtApp();
  const readPinnedMessages = () =>
    readItems(async () => {
      const roomId = requirePartitionKey(currentRoomId.value, readPinnedMessages.name);
      return toMessagePage(roomId, await $trpc.message.readMessages.query({ filter: { isPinned: true }, roomId }));
    });
  const readMorePinnedMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const roomId = requirePartitionKey(currentRoomId.value, readMorePinnedMessages.name);
      return toMessagePage(
        roomId,
        await $trpc.message.readMessages.query({ before: Number(cursor), filter: { isPinned: true }, roomId }),
      );
    }, onComplete);
  return { readMorePinnedMessages, readPinnedMessages };
};
