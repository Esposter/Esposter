import type { RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useRoomPlaceholder = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const userStore = useUserStore();
  const { getRoomMemberMap } = userStore;
  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    const creatorName = getRoomMemberMap(roomValue.id)?.get(roomValue.userId)?.displayName;
    return creatorName ? `${creatorName}'s Room` : "";
  });
};
