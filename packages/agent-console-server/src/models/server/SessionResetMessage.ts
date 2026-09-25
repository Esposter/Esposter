import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A session was (re)opened: the log kept for it is replaced by the events that follow, which a rewind needs
export interface SessionResetMessage extends BaseServerMessage<ServerMessageType.SessionReset> {
  sessionId: string;
}

export const sessionResetMessageSchema: z.ZodObject<{
  sessionId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.SessionReset>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.SessionReset)).shape,
  sessionId: z.string().min(1),
}) satisfies z.ZodType<SessionResetMessage>;
