import type { RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useRoomPlaceholder = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const userStore = useUserStore();
  const { getRoomMemberName } = userStore;
  const { userMap } = storeToRefs(userStore);
  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    // A room nobody has opened this session has no member rows yet, so the creator's account name stands in
    const creatorName = getRoomMemberName(roomValue.id, roomValue.userId);
    return creatorName ? `${creatorName}'s Room` : "";
  });
};
