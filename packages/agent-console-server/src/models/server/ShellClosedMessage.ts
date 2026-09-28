import type { ShellId } from "#src/models/command/ShellId";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { shellIdSchema } from "#src/models/command/ShellId";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A shell that ended — its program exited, or it was closed with its session or the host
export interface ShellClosedMessage extends BaseServerMessage<ServerMessageType.ShellClosed>, ShellId {}

export const shellClosedMessageSchema: z.ZodObject<{
  shellId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.ShellClosed>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.ShellClosed)).shape,
  ...shellIdSchema.shape,
}) satisfies z.ZodType<ShellClosedMessage>;
