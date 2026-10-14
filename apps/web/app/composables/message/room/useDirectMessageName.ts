import type { RoomInMessage } from "@esposter/db-schema";

import { getDirectMessageName } from "@/services/message/room/getDirectMessageName";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useDirectMessageName = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const directMessageStore = useDirectMessageStore();
  const { getDirectMessageParticipants } = directMessageStore;

  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    // A named room never reads its participants, since the name is what it is called by
    return getDirectMessageName(roomValue, roomValue.name ? [] : getDirectMessageParticipants(roomValue.id));
  });
};
