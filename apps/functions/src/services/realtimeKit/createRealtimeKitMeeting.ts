import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";

import { HttpMethod } from "#src/models/realtimeKit/HttpMethod";
import { requestRealtimeKit } from "#src/services/realtimeKit/requestRealtimeKit";
import { z } from "zod";

// A meeting has no id the caller can choose and no idempotency key, so the caller keeps the id this returns
export const createRealtimeKitMeeting = async (credentials: RealtimeKitCredentials): Promise<string> => {
  const { id } = await requestRealtimeKit(credentials, {
    body: {},
    method: HttpMethod.Post,
    path: "/meetings",
    schema: z.object({ id: z.string() }),
  });
  return id;
};
