import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";

export const useRoomPlaceholder = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    const creator = userMap.value.get(roomValue.userId);
    return creator ? `${getDisplayName(creator, roomValue.id)}'s Room` : "";
  });
};
