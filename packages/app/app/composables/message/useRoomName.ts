import type { Room } from "#shared/db/schema/rooms";

import { useRoomStore } from "@/store/message/room";

export const useRoomName = (room: MaybeRefOrGetter<null | Room>) => {
  const roomStore = useRoomStore();
  const { memberMap } = storeToRefs(roomStore);
  const placeholder = computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    const member = memberMap.value.get(roomValue.userId);
    if (!member) return "";
    return `${member.name}'s Room`;
  });
  const name = computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    return roomValue.name || placeholder.value;
  });
  return { name, placeholder };
};
