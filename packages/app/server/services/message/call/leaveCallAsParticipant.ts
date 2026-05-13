import type { Context } from "@@/server/trpc/context";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export const leaveCallAsParticipant = async (
  db: Context["db"],
  callSessionId: string,
  sessionId: string,
  userId: string,
): Promise<boolean> => {
  const isDeleted = deleteCallParticipant(callSessionId, sessionId);
  if (!isDeleted) return false;
  callEventEmitter.emit("leaveCall", { callSessionId, id: sessionId, sessionId });

  if (getCallParticipants(callSessionId).length > 0) return true;

  const callSession = await db.query.callSessionsInMessage.findFirst({
    columns: { roomId: true },
    where: { id: { eq: callSessionId } },
  });
  const callStart = callStartTimeMap.get(callSessionId);
  callStartTimeMap.delete(callSessionId);
  if (!callSession?.roomId) return true;

  const callDurationSeconds = callStart ? Math.round((Date.now() - callStart.getTime()) / 1000) : 0;
  const { roomId } = callSession;
  await getResultAsync(async () => {
    const [messageClient, messageAscendingClient] = await Promise.all([
      useTableClient(AzureTable.Messages),
      useTableClient(AzureTable.MessagesAscending),
    ]);
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      message: String(callDurationSeconds),
      roomId,
      type: MessageType.Call,
      userId,
    });
    messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
  })
    .orTee(console.error)
    .unwrapOr(undefined);
  return true;
};
