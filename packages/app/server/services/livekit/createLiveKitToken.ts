import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { AccessToken, TrackSource } from "livekit-server-sdk";

export const createLiveKitToken = async (callSessionId: string, participant: CallParticipant) => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return { livekitToken: "", livekitUrl: "" };

  const token = new AccessToken(livekit.apiKey, livekit.apiSecret, {
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
  return { livekitToken: await token.toJwt(), livekitUrl: livekit.url };
};
