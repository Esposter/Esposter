import type { RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useRoomPlaceholder = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    const creator = userMap.value.get(roomValue.userId);
    return creator ? `${creator.name}'s Room` : "";
  });
};
