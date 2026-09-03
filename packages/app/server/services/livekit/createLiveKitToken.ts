import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { getLiveKitCredentials } from "@@/server/services/livekit/getLiveKitCredentials";
import { AccessToken, TrackSource } from "livekit-server-sdk";

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
    canPublishSources: [
      TrackSource.MICROPHONE,
      TrackSource.CAMERA,
      TrackSource.SCREEN_SHARE,
      TrackSource.SCREEN_SHARE_AUDIO,
    ],
    canSubscribe: true,
    room: callSessionId,
    roomJoin: true,
  });
  return { liveKitToken: await token.toJwt(), liveKitUrl: credentials.url };
};
