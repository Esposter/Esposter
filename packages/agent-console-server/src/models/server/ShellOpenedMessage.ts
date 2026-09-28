import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A shell running on the host: answered to the command that opened it, and replayed under no command id to a page that
// Connects while it runs
export interface ShellOpenedMessage extends BaseServerMessage<ServerMessageType.ShellOpened> {
  commandId: string;
  sessionId: string;
  shellId: string;
}

export const shellOpenedMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  sessionId: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.ShellOpened>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.ShellOpened)).shape,
  commandId: z.string(),
  sessionId: z.string().min(1),
  shellId: z.string().min(1),
}) satisfies z.ZodType<ShellOpenedMessage>;
