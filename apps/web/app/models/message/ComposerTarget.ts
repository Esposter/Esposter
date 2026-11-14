import type { ClientMessage } from "@/models/message/ClientMessage";

// Which composer a piece of composer state belongs to. A room's own composer and its thread pane's composer are
// On screen at the same time and each holds its own text and its own attachments, so the room alone does not say
// Whose state a write is for — the thread root id of 0 is the room composer, since a message id is always positive
export interface ComposerTarget {
  roomId: ClientMessage["roomId"];
  threadRootId: 0 | ClientMessage["id"];
}
