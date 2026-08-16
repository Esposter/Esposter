import type { Context } from "@@/server/trpc/context";

import { dayjs } from "#shared/services/dayjs";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { MessageType } from "@esposter/db-schema";
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
  // Best-effort after the leaveCall notify — the call-summary read is the last participant's bookkeeping, so a
  // Failed lookup loses the summary message, never the leave that already happened
  await getResultAsync(async () => {
    const callSession = await db.query.callSessionsInMessage.findFirst({
      columns: { roomId: true, threadRootRowKey: true },
      where: { id: { eq: callSessionId } },
    });
    if (!callSession?.roomId) return;

    const callDurationSeconds = callStart
      ? Math.round(dayjs.duration(Date.now() - callStart.getTime()).asSeconds())
      : 0;
    // The line is worded by the duration it reports, which is what the renderer reads an ended call back as
    await createSystemRoomMessage(callSession.roomId, userId, String(callDurationSeconds), sessionId, {
      // The summary belongs where the call was — the thread it ran in, or the room itself
      replyRowKey: callSession.threadRootRowKey || undefined,
      type: MessageType.Call,
    });
  }).match(noop, console.error);
  return true;
};
