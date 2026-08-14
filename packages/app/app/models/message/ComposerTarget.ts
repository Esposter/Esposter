import type { MessageEntity } from "@esposter/db-schema";

// Which composer a piece of composer state belongs to. A room's own composer and its thread pane's composer are
// On screen at the same time and each holds its own text and its own attachments, so the room alone no longer
// Says whose state a write is for — the empty root rowKey is the room composer
export interface ComposerTarget {
  roomId: MessageEntity["partitionKey"];
  threadRootRowKey: MessageEntity["rowKey"];
}
