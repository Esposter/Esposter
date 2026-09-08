import { useRoomStore } from "@/store/message/room";

export const useRoomName = (roomId: MaybeRefOrGetter<string>) => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const room = computed(() => {
    const roomIdValue = toValue(roomId);
    if (roomIdValue) return rooms.value.find(({ id }) => id === roomIdValue);
    else return undefined;
  });
  const placeholder = useRoomPlaceholder(room);
  return computed(() => room.value?.name ?? placeholder.value);
};
