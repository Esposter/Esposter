import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

export interface SessionOpenedMessage extends BaseServerMessage<ServerMessageType.SessionOpened> {
  commandId: string;
  sessionId: string;
}

export const sessionOpenedMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.SessionOpened>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.SessionOpened)).shape,
  commandId: z.string().min(1),
  sessionId: z.string().min(1),
}) satisfies z.ZodType<SessionOpenedMessage>;
