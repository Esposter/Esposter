import type { StandardMessageEntity } from "@esposter/db-schema";

import { messageEventEmitter } from "#server/services/message/events/messageEventEmitter";
import { getMessageTableClients } from "#server/services/message/getMessageTableClients";
import { createMessage } from "@esposter/db";
import { MessageType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Every line the server writes into a room on a member's behalf. The action that prompted it has already landed,
// So a failure costs the room one line and never the action — and the Result is handed back rather than logged
// Here, so the caller terminates the chain where it knows what the line was announcing
// (openspec/specs/architecture/persist-then-notify/design.md).
export const createSystemRoomMessage = (
  roomId: string,
  userId: string,
  message: string,
  sessionId: string,
  // A line that points at another message (a pin) is worded by its target rather than by text of its own
  { replyRowKey = "", type = MessageType.System }: Partial<Pick<StandardMessageEntity, "replyRowKey" | "type">> = {},
) =>
  getResultAsync(async () => {
    const [messageClient, messageAscendingClient] = await getMessageTableClients();
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      message,
      replyRowKey,
      roomId,
      type,
      userId,
    });
    messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
  });
