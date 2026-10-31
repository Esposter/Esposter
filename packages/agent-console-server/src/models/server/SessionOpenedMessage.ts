import type { SessionId } from "#src/models/command/SessionId";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { sessionIdSchema } from "#src/models/command/SessionId";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

export interface SessionOpenedMessage extends BaseServerMessage<ServerMessageType.SessionOpened>, SessionId {
  commandId: string;
}

export const sessionOpenedMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.SessionOpened>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.SessionOpened)).shape,
  ...sessionIdSchema.shape,
  commandId: z.string().min(1),
}) satisfies z.ZodType<SessionOpenedMessage>;
