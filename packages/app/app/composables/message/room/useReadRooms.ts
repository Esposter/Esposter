import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readRooms = () => readItems(() => $trpc.room.readRooms.useQuery({ roomId: currentRoomId.value }));
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.room.readRooms.query({ cursor }), onComplete);
  return { readMoreRooms, readRooms };
};
