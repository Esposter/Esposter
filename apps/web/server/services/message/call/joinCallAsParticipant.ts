import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { createCallParticipant } from "@@/server/services/message/call/createCallParticipant";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const joinCallAsParticipant = async (
  { id: callSessionId, roomId, threadRootRowKey }: Pick<CallSessionInMessage, "id" | "roomId" | "threadRootRowKey">,
  callParticipant: CallParticipant,
  sessionId: string,
  userId: string,
) => {
  const isFirstJoiner = !callSessionParticipantMap.has(callSessionId);
  const participant = { ...callParticipant, isCameraEnabled: false };
  const participantMap = createCallParticipant(callSessionId, participant);
  callEventEmitter.emit("joinCall", { callSessionId, participant, sessionId });

  if (isFirstJoiner) {
    callStartTimeMap.set(callSessionId, new Date());
    // Best-effort after the joinCall notify — the announcement is bookkeeping for a join that already happened,
    // And a retry reads `isFirstJoiner` as false, so rethrowing would fail the join and still never write the
    // Line. It is worded by the call it announces rather than by text of its own, so it carries no message: a
    // Started call is the absence of a duration, which is what the renderer reads it back as
    // A call started in a thread announces itself in that thread, through the same reply the rest of the thread
    // Is made of, rather than in the room the thread happens to live in
    if (roomId)
      await getResultAsync(() =>
        createSystemRoomMessage(roomId, userId, "", sessionId, {
          replyRowKey: threadRootRowKey || undefined,
          type: MessageType.Call,
        }),
      ).match(noop, console.error);
  }

  return { callSessionId, participantMap };
};
