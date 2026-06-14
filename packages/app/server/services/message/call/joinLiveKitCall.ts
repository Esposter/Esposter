import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOutput } from "@@/server/models/room/call/JoinCallOutput";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { createLiveKitRoom } from "@@/server/services/livekit/createLiveKitRoom";
import { createLiveKitToken } from "@@/server/services/livekit/createLiveKitToken";
import { joinCallAsParticipant } from "@@/server/services/message/call/joinCallAsParticipant";

export const joinLiveKitCall = async (
  callSession: Pick<CallSessionInMessage, "id" | "roomId">,
  participant: CallParticipant,
  userId: string,
): Promise<JoinCallOutput> => {
  await createLiveKitRoom(callSession.id);
  const livekit = await createLiveKitToken(callSession.id, participant);
  const result = await joinCallAsParticipant(callSession, participant, participant.id, userId);
  return { ...result, ...livekit };
};
