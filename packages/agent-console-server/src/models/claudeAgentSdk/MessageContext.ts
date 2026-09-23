import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";
// Where a message's blocks came from, stamped on every event its content maps to
export interface MessageContext extends MessageUuid, ParentToolUseId {
  createdAt: Date;
}
