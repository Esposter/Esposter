import type { NewMessage } from "#src/models/room/NewMessage";

// What a change to one live message sets, written by `#updateLiveMessage`, which moves its updatedAt. A delete tombstones
// Its rows in a bulk update of its own, `#tombstoneMessages`
export type MessageUpdate = Partial<
  Pick<NewMessage, "editedAt" | "filenames" | "files" | "isPinned" | "linkPreviewResponse" | "mentions" | "message">
>;
