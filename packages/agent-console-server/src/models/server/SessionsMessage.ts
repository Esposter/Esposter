import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";
import type { SessionSummary } from "#src/models/session/SessionSummary";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { sessionSummarySchema } from "#src/models/session/SessionSummary";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface SessionsMessage extends BaseServerMessage<ServerMessageType.Sessions> {
  sessions: SessionSummary[];
}

export const sessionsMessageSchema: z.ZodObject<{
  sessions: z.ZodArray<typeof sessionSummarySchema>;
  type: z.ZodLiteral<ServerMessageType.Sessions>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Sessions)).shape,
  sessions: createUniqueArraySchema(sessionSummarySchema, "id"),
}) satisfies z.ZodType<SessionsMessage>;
