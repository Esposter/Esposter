import { readMessagesByRowKeys } from "@@/server/services/message/readMessagesByRowKeys";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { AzureEntityType } from "@esposter/db-schema";
// A thread call hangs off the message its thread is rooted at, and that rowKey is written onto every join and
// Leave message as the replyRowKey. Membership does not bound it and the session's unique index rejects only
// Exact duplicates, so an unknown rowKey would open a session of its own whose messages reply to nothing
export const requireThreadRoot = async (roomId: string, threadRootRowKey: string) => {
  if (!threadRootRowKey) return;

  const [message] = await readMessagesByRowKeys(roomId, [threadRootRowKey]);
  if (!message) throw getNotFoundError(AzureEntityType.Message, threadRootRowKey);
};
