import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";
import type { CallParticipant } from "@esposter/db-schema";

import { requestRealtimeKit } from "#src/services/realtimeKit/requestRealtimeKit";
import { z } from "zod";

// Adds a connection to the meeting with the preset that matches what it may publish, and returns the token the client
// joins with. The connection is identified by its session id, which is what the webhook reports back
export const addRealtimeKitParticipant = async (
  credentials: RealtimeKitCredentials,
  meetingId: string,
  participant: CallParticipant,
  presetName: string,
): Promise<{ id: string; token: string }> =>
  requestRealtimeKit(credentials, {
    body: { custom_participant_id: participant.id, name: participant.name, preset_name: presetName },
    method: "POST",
    path: `/meetings/${meetingId}/participants`,
    schema: z.object({ id: z.string(), token: z.string() }),
  });
