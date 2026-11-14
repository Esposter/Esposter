import type { MessageInMessage } from "@esposter/db-schema";

// Which composer a piece of composer state belongs to. A room's own composer and its thread pane's composer are
// On screen at the same time and each holds its own text and its own attachments, so the room alone does not say
// Whose state a write is for — the empty thread root id is the room composer
export interface ComposerTarget {
  roomId: MessageInMessage["roomId"];
  threadRootId: "" | MessageInMessage["id"];
}
