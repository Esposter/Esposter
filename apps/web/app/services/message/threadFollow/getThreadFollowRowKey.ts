import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { threadFollowsInMessage } from "@esposter/db-schema";

// The key of a follow row: the room, the thread root and the member, in the order the table's composite key names them
export const getThreadFollowRowKey = (
  roomId: string,
  threadRootId: ClientMessage["id"],
  userId: string,
): RowKeyOf<typeof threadFollowsInMessage> => [roomId, threadRootId, userId];
