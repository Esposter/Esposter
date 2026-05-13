import { RoomServiceClient } from "livekit-server-sdk";
import { useRuntimeConfig } from "nitropack/runtime";

export const createLiveKitRoom = async (callSessionId: string) => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return;

  const roomServiceClient = new RoomServiceClient(livekit.url, livekit.apiKey, livekit.apiSecret);
  const rooms = await roomServiceClient.listRooms([callSessionId]);
  if (rooms.some(({ name }) => name === callSessionId)) return;
  await roomServiceClient.createRoom({ emptyTimeout: 60, name: callSessionId });
};
