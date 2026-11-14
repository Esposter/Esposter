import type { Context } from "#server/trpc/context";
import type { CallLeave } from "@esposter/db-schema";

import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The call's summary line, written by the departure that ends a room call: its duration, in the thread the call ran in or
// else the room. A standalone call has no room and writes none, and a departure that did not end the call writes none
export const writeCallSummary = (
  db: Context["db"],
  callSessionId: string,
  { callDurationSeconds, sessionId, userId }: CallLeave,
) => {
  if (callDurationSeconds === null) return Promise.resolve();
  return getResultAsync(async () => {
    const callSession = await db.query.callSessionsInMessage.findFirst({
      columns: { roomId: true, threadRootRowKey: true },
      where: { id: { eq: callSessionId } },
    });
    if (!callSession?.roomId) return;

    // The line is worded by the duration it reports, which is what the renderer reads an ended call back as
    await createSystemRoomMessage(callSession.roomId, userId, String(callDurationSeconds), sessionId, {
      replyRowKey: callSession.threadRootRowKey,
      type: MessageType.Call,
    }).match(noop, console.error);
  }).match(noop, console.error);
};
