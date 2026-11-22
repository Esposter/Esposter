import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";

import { checkIsNewerThanCopy } from "#src/services/message/checkIsNewerThanCopy";
import { useReplyStore } from "#src/store/message/input/reply";

export const useReadReplies = () => {
  const replyStore = useReplyStore();
  const { getReplyMapRef, readMessagesInFlight } = replyStore;
  return async (roomId: RoomInMessage["id"], replyToIds: ClientMessage["id"][]) => {
    if (replyToIds.length === 0) return;

    const messages = await readMessagesInFlight(roomId, replyToIds);
    const replyMap = getReplyMapRef(roomId);
    for (const message of messages)
      if (checkIsNewerThanCopy(replyMap.value.get(message.id), message))
        replyMap.value.set(message.id, { ...message, roomId });
  };
};
