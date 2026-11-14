import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { DatabaseEntityType } from "@esposter/db-schema";

// A thread call hangs off the message its thread is rooted at, and that id is written onto every join and leave message
// As the reply it is. Membership does not bound it and the session's unique index rejects only exact duplicates, so an
// Unknown id would open a session of its own whose messages reply to nothing. The room's own call names no root: 0
export const requireThreadRoot = async (roomId: string, threadRootId: number) => {
  if (threadRootId === 0) return;

  const [message] = await useRoomObject(roomId).readMessagesByIds([threadRootId]);
  if (!message) throw getNotFoundError(DatabaseEntityType.Message, String(threadRootId));
};
