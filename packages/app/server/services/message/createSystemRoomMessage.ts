import type { StandardCreateMessageInput } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Every line the server writes into a room on a member's behalf. Best-effort by construction: the action that
// Prompted it has already landed, so a failure here costs the room one line and never the action itself.
export const createSystemRoomMessage = async (
  roomId: string,
  userId: string,
  message: string,
  sessionId: string,
  // A line that points at another message (a pin) is worded by its target rather than by text of its own
  { replyRowKey, type = MessageType.System }: Partial<Pick<StandardCreateMessageInput, "replyRowKey" | "type">> = {},
) => {
  await getResultAsync(async () => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      message,
      replyRowKey,
      roomId,
      type,
      userId,
    });
    messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
  }).match(noop, console.error);
};
