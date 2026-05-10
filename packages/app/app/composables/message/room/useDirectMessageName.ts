import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { takeOne } from "@esposter/shared";

export const useDirectMessageName = (room: MaybeRefOrGetter<RoomInMessage | undefined>) => {
  const directMessageStore = useDirectMessageStore();
  const { directMessageParticipantsMap } = storeToRefs(directMessageStore);

  return computed(() => {
    const roomValue = toValue(room);
    if (!roomValue) return "";
    if (roomValue.name) return roomValue.name;

    const participants = directMessageParticipantsMap.value.get(roomValue.id);
    if (!participants || participants.length === 0) return "";
    if (participants.length === 1) return takeOne(participants).name;
    return participants.map(({ name }) => name).join(", ");
  });
};
