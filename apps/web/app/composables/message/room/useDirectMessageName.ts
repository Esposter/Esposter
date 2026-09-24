import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useDirectMessageName = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const directMessageStore = useDirectMessageStore();
  const { getDirectMessageParticipants } = directMessageStore;

  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    if (roomValue.name) return roomValue.name;

    const participants = getDirectMessageParticipants(roomValue.id);
    return participants.map(({ name }) => name).join(", ");
  });
};
