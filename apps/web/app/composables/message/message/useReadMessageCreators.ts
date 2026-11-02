import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

// The creators the messages name, read with the messages that name them: a member for a message a member wrote, an app
// User for a webhook's. A message is drawn only once its creator is known, so every read of messages reads these first
export const useReadMessageCreators = () => {
  const readMembersByIds = useReadMembersByIds();
  const readAppUsers = useReadAppUsers();
  return async (roomId: RoomInMessage["id"], messages: MessageEntity[]) => {
    await Promise.all([
      readMembersByIds(roomId, [
        ...new Set(messages.flatMap((message) => (message.type === MessageType.Webhook ? [] : [message.userId]))),
      ]),
      readAppUsers(roomId, [
        ...new Set(messages.flatMap((message) => (message.type === MessageType.Webhook ? [message.appUser.id] : []))),
      ]),
    ]);
  };
};
