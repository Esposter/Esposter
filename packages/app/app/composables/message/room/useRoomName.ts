import { useRoomStore } from "@/store/message/room";

export const useRoomName = (roomId: MaybeRefOrGetter<string | undefined>) => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const room = computed(() => {
    const roomIdValue = toValue(roomId);
    if (!roomIdValue) return;
    return rooms.value.find(({ id }) => id === roomIdValue);
  });
  const placeholder = useRoomPlaceholder(room);
  return computed(() => room.value?.name ?? placeholder.value);
};
