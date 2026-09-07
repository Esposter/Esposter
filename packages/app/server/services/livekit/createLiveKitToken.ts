import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { CALL_TRACK_SOURCES, SCREEN_SHARE_TRACK_SOURCES } from "@@/server/services/livekit/constants";
import { getLiveKitCredentials } from "@@/server/services/livekit/getLiveKitCredentials";
import { AccessToken } from "livekit-server-sdk";

export const createLiveKitToken = async (callSessionId: string, participant: CallParticipant) => {
  const credentials = getLiveKitCredentials();
  if (!credentials) return { liveKitToken: "", liveKitUrl: "" };

  const token = new AccessToken(credentials.apiKey, credentials.apiSecret, {
    identity: participant.id,
    metadata: JSON.stringify({ userId: participant.userId }),
    name: participant.name,
  });
  token.addGrant({
    canPublish: true,
    canPublishSources: [...CALL_TRACK_SOURCES, ...SCREEN_SHARE_TRACK_SOURCES],
    canSubscribe: true,
    room: callSessionId,
    roomJoin: true,
  });
  return { liveKitToken: await token.toJwt(), liveKitUrl: credentials.url };
};
