import { getResultAsync, noop } from "@esposter/shared";
import { RoomServiceClient } from "livekit-server-sdk";
import { useRuntimeConfig } from "nitropack/runtime";

export const createLiveKitRoom = async (callSessionId: string) => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return;

  const roomServiceClient = new RoomServiceClient(livekit.url, livekit.apiKey, livekit.apiSecret);
  await getResultAsync(() => roomServiceClient.createRoom({ emptyTimeout: 60, name: callSessionId })).match(
    noop,
    (error) => {
      if (!/already exists/i.test(error.message)) throw error;
    },
  );
};
