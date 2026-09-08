import { getLiveKitCredentials } from "@@/server/services/livekit/getLiveKitCredentials";
import { RoomServiceClient } from "livekit-server-sdk";

export const createLiveKitRoomServiceClient = (): RoomServiceClient | undefined => {
  const credentials = getLiveKitCredentials();
  if (credentials) return new RoomServiceClient(credentials.url, credentials.apiKey, credentials.apiSecret);
  else return undefined;
};
