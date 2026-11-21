import type { ClientMessage } from "#src/models/message/ClientMessage";

// The key of a follow row: the room, the thread root and the member, in the order the table's composite key names them
export const getThreadFollowRowKey = (
  roomId: string,
  threadRootId: ClientMessage["id"],
  userId: string,
): [string, number, string] => [roomId, threadRootId, userId];
