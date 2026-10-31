import type { SessionId } from "#src/models/command/SessionId";
import type { ShellId } from "#src/models/command/ShellId";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { sessionIdSchema } from "#src/models/command/SessionId";
import { shellIdSchema } from "#src/models/command/ShellId";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A shell running on the host: answered to the command that opened it, and replayed under no command id to a page that
// Connects while it runs
export interface ShellOpenedMessage extends BaseServerMessage<ServerMessageType.ShellOpened>, SessionId, ShellId {
  commandId: string;
}

export const shellOpenedMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  sessionId: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.ShellOpened>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.ShellOpened)).shape,
  ...sessionIdSchema.shape,
  ...shellIdSchema.shape,
  commandId: z.string(),
}) satisfies z.ZodType<ShellOpenedMessage>;
