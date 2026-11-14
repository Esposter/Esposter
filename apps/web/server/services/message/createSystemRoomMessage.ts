import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { MessageType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Every line the server writes into a room on a member's behalf. The action that prompted it has already landed,
// So a failure costs the room one line and never the action — and the Result is handed back rather than logged
// Here, so the caller terminates the chain where it knows what the line was announcing
// (openspec/specs/architecture/persist-then-notify/design.md).
// A line is sent to every socket, the member's own tab included, since a line the server wrote has no optimistic copy
// on that tab to replace
export const createSystemRoomMessage = (
  roomId: string,
  userId: string,
  message: string,
  // A line that points at another message (a pin, a call in a thread) is worded by its target rather than by text of its own
  { replyToId, type = MessageType.System }: { replyToId?: number; type?: MessageType } = {},
) => getResultAsync(() => useRoomObject(roomId).createMessage({ message, replyToId, type }, { userId }));
