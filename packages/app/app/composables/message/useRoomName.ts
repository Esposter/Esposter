import type { Room } from "@esposter/db";

import { getRoomName } from "@/services/message/room/getRoomName";
import { getRoomPlaceholder } from "@/services/message/room/getRoomPlaceholder";
import { useRoomStore } from "@/store/message/room";

export const useRoomName = (room: MaybeRefOrGetter<null | Room>) => {
  const roomStore = useRoomStore();
  const { memberMap } = storeToRefs(roomStore);
  const placeholder = computed(() => getRoomPlaceholder(toValue(room), memberMap.value));
  const name = computed(() => getRoomName(toValue(room), memberMap.value));
  return { name, placeholder };
};
