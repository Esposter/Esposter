import type { ClientMessage } from "@/models/message/ClientMessage";
import type { RoomInMessage } from "@esposter/db-schema";

// Everything a rendered message reads besides itself — its author, the message it replies to, its attachments'
// Urls and its reactions — for a room's page read and a thread's read alike
export const useReadMessageMetadata = () => {
  const readUsersByIds = useReadUsersByIds();
  const readMessageCreators = useReadMessageCreators();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  // Named by the room the page was read for — every caller reaches here after an await, by which time the room on
  // Screen may be another one
  return async (roomId: RoomInMessage["id"], messages: ClientMessage[]) => {
    if (messages.length === 0) return;

    // A reactor is named by its row in the room, so the reactors of the emojis read are read too
    const readReactorMembers = async () => {
      const emojis = await readEmojis(
        roomId,
        messages.map(({ id }) => id),
      );
      await readUsersByIds(
        roomId,
        emojis.flatMap(({ userIds }) => userIds),
      );
    };
    await Promise.all([
      readMessageCreators(roomId, messages),
      readReplies(roomId, [...new Set(messages.flatMap(({ replyToId }) => (replyToId ? [replyToId] : [])))]),
      readFiles(
        roomId,
        messages.flatMap(({ files }) => files),
      ),
      readReactorMembers(),
    ]);
  };
};
