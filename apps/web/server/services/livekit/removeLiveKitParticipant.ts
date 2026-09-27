import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";

// Disconnects one connection at the SFU, for a departure the server decides rather than the departing client.
// Best-effort: a connection LiveKit no longer holds is already the outcome asked for
export const removeLiveKitParticipant = async (callSessionId: string, id: string) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  await getResultAsync(() => roomServiceClient.removeParticipant(callSessionId, id)).match(noop, console.error);
};
