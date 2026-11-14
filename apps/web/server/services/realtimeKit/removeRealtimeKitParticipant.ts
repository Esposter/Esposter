import { getRealtimeKitCredentials } from "#server/services/realtimeKit/getRealtimeKitCredentials";
import { requestRealtimeKit } from "#server/services/realtimeKit/requestRealtimeKit";
import { z } from "zod";

// Disconnects one connection at RealtimeKit, for a departure the server decides rather than the departing client. A
// Failure rejects, so a caller that must not carry on past a kick it did not land can stop there
export const removeRealtimeKitParticipant = async (meetingId: string | null, customParticipantId: string) => {
  const credentials = getRealtimeKitCredentials();
  if (!credentials || !meetingId) return;

  await requestRealtimeKit(credentials, {
    body: { custom_participant_ids: [customParticipantId] },
    method: "POST",
    path: `/meetings/${meetingId}/active-session/kick`,
    schema: z.unknown().optional(),
  });
};
