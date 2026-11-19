import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";
import type { CallParticipant } from "@esposter/db-schema";

import { HttpMethod } from "#src/models/realtimeKit/HttpMethod";
import { requestRealtimeKit } from "#src/services/realtimeKit/requestRealtimeKit";
import { z } from "zod";

// Adds a connection to the meeting with the preset that matches what it may publish, and returns the token.
// The client joins with it. The connection is identified by its participant id, the custom id the webhook reports back.
// That id names it to the call's members, which RealtimeKit shows them, so it is never the auth session it joined under
export const addRealtimeKitParticipant = async (
  credentials: RealtimeKitCredentials,
  meetingId: string,
  participant: CallParticipant,
  presetName: string,
): Promise<{ id: string; token: string }> =>
  requestRealtimeKit(credentials, {
    body: { custom_participant_id: participant.id, name: participant.name, preset_name: presetName },
    method: HttpMethod.Post,
    path: `/meetings/${meetingId}/participants`,
    schema: z.object({ id: z.string(), token: z.string() }),
  });
