import type { SessionId } from "#src/models/command/SessionId";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { sessionIdSchema } from "#src/models/command/SessionId";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A session was (re)opened: the log kept for it is replaced by the events that follow, which a rewind needs
export interface SessionResetMessage extends BaseServerMessage<ServerMessageType.SessionReset>, SessionId {}

export const sessionResetMessageSchema: z.ZodObject<{
  sessionId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.SessionReset>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.SessionReset)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<SessionResetMessage>;
