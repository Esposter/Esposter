import { useRoomStore } from "@/store/message/room";

export const useRoomName = () => {
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  const placeholder = useRoomPlaceholder();
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return computed(() => currentRoom.value?.name || placeholder.value);
};
