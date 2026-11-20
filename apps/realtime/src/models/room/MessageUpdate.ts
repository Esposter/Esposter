import type { messagesInRoom } from "@esposter/db-schema";

// What a change to one live message sets, written by `#updateLiveMessage`, which moves its updatedAt. A delete tombstones
// Its rows in a bulk update of its own, `#tombstoneMessages`
export type MessageUpdate = Partial<
  Pick<
    typeof messagesInRoom.$inferInsert,
    "editedAt" | "filenames" | "files" | "isPinned" | "linkPreviewResponse" | "mentions" | "message"
  >
>;
