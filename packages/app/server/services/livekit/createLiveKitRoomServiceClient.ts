import { RoomServiceClient } from "livekit-server-sdk";

export const createLiveKitRoomServiceClient = () => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return undefined;
  return new RoomServiceClient(livekit.url, livekit.apiKey, livekit.apiSecret);
};
