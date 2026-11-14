import { getRealtimeKitCredentials } from "#server/services/realtimeKit/getRealtimeKitCredentials";
import { requestRealtimeKit } from "#server/services/realtimeKit/requestRealtimeKit";
import { getResultAsync, noop } from "@esposter/shared";
import { z } from "zod";

// Disconnects one connection at RealtimeKit, for a departure the server decides rather than the departing client.
// Best-effort: a connection RealtimeKit no longer holds is already the outcome asked for
export const removeRealtimeKitParticipant = async (meetingId: string | null, customParticipantId: string) => {
  const credentials = getRealtimeKitCredentials();
  if (!credentials || !meetingId) return;

  await getResultAsync(() =>
    requestRealtimeKit(credentials, {
      body: { custom_participant_ids: [customParticipantId] },
      method: "POST",
      path: `/meetings/${meetingId}/active-session/kick`,
      schema: z.unknown().optional(),
    }),
  ).match(noop, console.error);
};
