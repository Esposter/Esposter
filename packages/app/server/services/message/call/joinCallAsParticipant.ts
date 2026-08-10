import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { createCallParticipant } from "@@/server/services/message/call/createCallParticipant";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const joinCallAsParticipant = async (
  { id: callSessionId, roomId }: Pick<CallSessionInMessage, "id" | "roomId">,
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
    // Best-effort after the joinCall notify, like the summary message `leaveCallAsParticipant` writes — the
    // Announcement is bookkeeping for a join that already happened, and a retry reads `isFirstJoiner` as false,
    // So rethrowing would fail the join and still never write the line on the way back through.
    // The line is worded by the call it announces rather than by text of its own, so it carries no message —
    // A started call is the absence of a duration, which is what the renderer reads it back as
    if (roomId)
      await getResultAsync(() =>
        createSystemRoomMessage(roomId, userId, "", sessionId, { type: MessageType.Call }),
      ).match(noop, console.error);
  }

  return { callSessionId, participantMap };
};
