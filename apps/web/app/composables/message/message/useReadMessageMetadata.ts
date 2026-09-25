import type { MessageEntity, RoomInMessage, StandardMessageEntity, WebhookMessageEntity } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";

// Everything a rendered message reads besides itself — its author, the message it replies to, its attachments'
// Urls and its reactions — for a room's page read and a thread's read alike
export const useReadMessageMetadata = () => {
  const readMembersByIds = useReadMembersByIds();
  const readAppUsers = useReadAppUsers();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  // Named by the room the page was read for — every caller reaches here after an await, by which time the room on
  // Screen may be another one
  return async (roomId: RoomInMessage["id"], messages: MessageEntity[]) => {
    if (messages.length === 0) return;

    const webhookMessages: WebhookMessageEntity[] = [];
    const standardMessages: StandardMessageEntity[] = [];

    for (const message of messages)
      if (message.type === MessageType.Webhook) webhookMessages.push(message);
      else standardMessages.push(message);

    await Promise.all([
      readMembersByIds(roomId, [...new Set(standardMessages.map(({ userId }) => userId))]),
      readAppUsers(roomId, [...new Set(webhookMessages.map(({ appUser }) => appUser.id))]),
      readReplies(roomId, [
        ...new Set(standardMessages.map(({ replyRowKey }) => replyRowKey).filter((value) => value !== undefined)),
      ]),
      readFiles(
        roomId,
        standardMessages.flatMap(({ files }) => files),
      ),
      readEmojis(
        roomId,
        messages.map(({ rowKey }) => rowKey),
      ),
    ]);
  };
};
