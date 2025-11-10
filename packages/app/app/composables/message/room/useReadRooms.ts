import { useReadUserToRooms } from "@/composables/message/useReadUserToRooms";
import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readUserToRoomsMetadata = useReadUserToRooms();
  const readRooms = () =>
    readItems(
      () => $trpc.room.readRooms.useQuery({ roomId: currentRoomId.value }),
      ({ items }) => readUserToRoomsMetadata(items.map(({ id }) => id)),
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const response = await $trpc.room.readRooms.query({ cursor });
      await readUserToRoomsMetadata(response.items.map(({ id }) => id));
      return response;
    }, onComplete);
  return { readMoreRooms, readRooms };
};
