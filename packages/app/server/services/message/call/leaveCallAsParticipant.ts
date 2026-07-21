import type { Context } from "@@/server/trpc/context";

import { dayjs } from "#shared/services/dayjs";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const leaveCallAsParticipant = async (
  db: Context["db"],
  callSessionId: string,
  sessionId: string,
  userId: string,
): Promise<boolean> => {
  const isDeleted = deleteCallParticipant(callSessionId, sessionId);
  if (!isDeleted) return false;
  callEventEmitter.emit("leaveCall", { callSessionId, id: sessionId, sessionId });

  if (callSessionParticipantMap.has(callSessionId)) return true;

  const callStart = callStartTimeMap.get(callSessionId);
  callStartTimeMap.delete(callSessionId);
  // Best-effort after the leaveCall notify — the call-summary read and write are the last participant's
  // Bookkeeping, so a failed lookup or write loses the summary message, never the leave that already happened
  await getResultAsync(async () => {
    const callSession = await db.query.callSessionsInMessage.findFirst({
      columns: { roomId: true },
      where: { id: { eq: callSessionId } },
    });
    if (!callSession?.roomId) return;

    const callDurationSeconds = callStart
      ? Math.round(dayjs.duration(Date.now() - callStart.getTime()).asSeconds())
      : 0;
    const [messageClient, messageAscendingClient] = await Promise.all([
      useTableClient(AzureTable.Messages),
      useTableClient(AzureTable.MessagesAscending),
    ]);
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      message: String(callDurationSeconds),
      roomId: callSession.roomId,
      type: MessageType.Call,
      userId,
    });
    messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
  }).match(noop, console.error);
  return true;
};
