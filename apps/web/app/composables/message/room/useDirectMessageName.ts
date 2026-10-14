import type { RoomInMessage } from "@esposter/db-schema";

import { getDirectMessageName } from "@/services/message/room/getDirectMessageName";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useDirectMessageName = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const directMessageStore = useDirectMessageStore();
  const { getDirectMessageParticipants } = directMessageStore;

  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    return getDirectMessageName(roomValue, getDirectMessageParticipants(roomValue.id));
  });
};
