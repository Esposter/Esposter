import type { RoomInMessage } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/user/member";

export const useRoomPlaceholder = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const memberStore = useMemberStore();
  const { memberMap } = storeToRefs(memberStore);
  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    const creator = memberMap.value.get(roomValue.userId);
    return creator ? `${creator.name}'s Room` : "";
  });
};
