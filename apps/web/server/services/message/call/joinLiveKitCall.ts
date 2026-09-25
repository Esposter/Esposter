import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallResult } from "@@/server/models/room/call/JoinCallResult";
import type { CallSessionInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createLiveKitRoom } from "@@/server/services/livekit/createLiveKitRoom";
import { createLiveKitToken } from "@@/server/services/livekit/createLiveKitToken";
import { joinCallAsParticipant } from "@@/server/services/message/call/joinCallAsParticipant";

export const joinLiveKitCall = async (
  callSession: Pick<CallSessionInMessage, "id" | "roomId" | "threadRootRowKey">,
  participant: CallParticipant,
  userId: string,
): Promise<Except<JoinCallResult, "isDoorkeeper">> => {
  await createLiveKitRoom(callSession.id);
  const liveKit = await createLiveKitToken(callSession.id, participant);
  const joinedCall = await joinCallAsParticipant(callSession, participant, participant.id, userId);
  return { ...joinedCall, ...liveKit };
};
