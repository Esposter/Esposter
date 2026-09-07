import { LIVE_KIT_ROOM_EMPTY_TIMEOUT_SECONDS } from "@@/server/services/livekit/constants";
import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";

export const createLiveKitRoom = async (callSessionId: string) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  await getResultAsync(() =>
    roomServiceClient.createRoom({ emptyTimeout: LIVE_KIT_ROOM_EMPTY_TIMEOUT_SECONDS, name: callSessionId }),
  ).match(noop, (error) => {
    if (!/already exists/iu.test(error.message)) throw error;
  });
};
