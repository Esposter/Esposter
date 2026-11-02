import type { MessageEntity, RoomInMessage } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

// The creators the messages name, read with the messages that name them: a user for a message a user wrote, an app User
// for a webhook's. Every read of messages reads these first, so a creator is known as its message lands, and one nobody
// resolves is drawn under the placeholder
export const useReadMessageCreators = () => {
  const readUsersByIds = useReadUsersByIds();
  const readAppUsers = useReadAppUsers();
  return async (roomId: RoomInMessage["id"], messages: MessageEntity[]) => {
    await Promise.all([
      readUsersByIds(roomId, [
        ...new Set(messages.flatMap((message) => (message.type === MessageType.Webhook ? [] : [message.userId]))),
      ]),
      readAppUsers(roomId, [
        ...new Set(messages.flatMap((message) => (message.type === MessageType.Webhook ? [message.appUser.id] : []))),
      ]),
    ]);
  };
};
