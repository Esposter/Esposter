import type { UserToRoomInMessage } from "@esposter/db-schema";

import { notifyMentionCounts } from "#server/services/message/notifyMentionCounts";
import { getResultAsync } from "@esposter/shared";

// Applies a write that moves mention counts, best-effort after the write as a send's counts are: a failure loses a badge
// And never the write that landed
export const applyMentionCounts = async (mutate: () => Promise<UserToRoomInMessage[]>): Promise<void> => {
  const rows = await getResultAsync(mutate).orTee(console.error).unwrapOr([]);
  await notifyMentionCounts(rows);
};
