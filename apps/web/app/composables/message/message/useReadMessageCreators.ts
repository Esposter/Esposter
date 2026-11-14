import type { MessageInMessage, RoomInMessage } from "@esposter/db-schema";

// The creators the messages name, read with the messages that name them: a user for a message a user wrote, an app User
// For a webhook's. Every read of messages reads these first, so a creator is known as its message lands, and one nobody
// Resolves is drawn under the placeholder
export const useReadMessageCreators = () => {
  const readUsersByIds = useReadUsersByIds();
  const readAppUsers = useReadAppUsers();
  return async (roomId: RoomInMessage["id"], messages: MessageInMessage[]) => {
    await Promise.all([
      readUsersByIds(roomId, [...new Set(messages.flatMap(({ userId }) => (userId ? [userId] : [])))]),
      readAppUsers(roomId, [...new Set(messages.flatMap(({ appUserId }) => (appUserId ? [appUserId] : [])))]),
    ]);
  };
};
