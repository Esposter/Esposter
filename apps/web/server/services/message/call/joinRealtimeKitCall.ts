import type { Context } from "#server/trpc/context";
import type { CallParticipant, CallSessionInMessage } from "@esposter/db-schema";
import type { JoinCallResult } from "#shared/models/room/call/JoinCallResult";
import type { Except } from "type-fest";
import { getOrCreateRealtimeKitMeetingId } from "#server/services/message/call/getOrCreateRealtimeKitMeetingId";
import { joinCallAsParticipant } from "#server/services/message/call/joinCallAsParticipant";
import { addRealtimeKitParticipant } from "#server/services/realtimeKit/addRealtimeKitParticipant";
import { JOIN_PUBLISH_SOURCES } from "#server/services/realtimeKit/constants";
import { getRealtimeKitCredentials } from "#server/services/realtimeKit/getRealtimeKitCredentials";
import { getRealtimeKitPresetName } from "#server/services/realtimeKit/getRealtimeKitPresetName";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { getOrCreate } from "@esposter/shared";

export const joinRealtimeKitCall = async (
  db: Context["db"],
  callSession: Pick<CallSessionInMessage, "id" | "roomId" | "threadRootRowKey">,
  participant: CallParticipant,
  userId: string,
): Promise<Except<JoinCallResult, "isDoorkeeper">> => {
  const credentials = getRealtimeKitCredentials();
  // A deployment without RealtimeKit joins the call with no media server, as it did before any media server was set up
  if (!credentials)
    return {
      ...(await joinCallAsParticipant(callSession, participant, participant.id, userId)),
      authToken: "",
      meetingId: "",
    };

  const meetingId = await getOrCreateRealtimeKitMeetingId(db, credentials, callSession.id);
  const realtimeKitParticipant = await addRealtimeKitParticipant(
    credentials,
    meetingId,
    participant,
    getRealtimeKitPresetName(JOIN_PUBLISH_SOURCES),
  );
  const joinedCall = await joinCallAsParticipant(callSession, participant, participant.id, userId);
  getOrCreate(realtimeKitParticipantMap, callSession.id, () => new Map()).set(participant.id, {
    id: realtimeKitParticipant.id,
    isRejoining: false,
    publishSources: [...JOIN_PUBLISH_SOURCES],
  });
  return { ...joinedCall, authToken: realtimeKitParticipant.token, meetingId };
};
