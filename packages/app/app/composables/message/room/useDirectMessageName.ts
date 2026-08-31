import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { takeOne } from "@esposter/shared";

export const useDirectMessageName = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const directMessageStore = useDirectMessageStore();
  const { getDirectMessageParticipants } = directMessageStore;

  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    if (roomValue.name) return roomValue.name;

    const participants = getDirectMessageParticipants(roomValue.id);
    if (participants.length === 0) return "";
    if (participants.length === 1) return takeOne(participants).name;
    return participants.map(({ name }) => name).join(", ");
  });
};
