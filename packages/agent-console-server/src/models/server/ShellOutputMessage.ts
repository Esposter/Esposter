import type { ShellId } from "#src/models/command/ShellId";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { shellIdSchema } from "#src/models/command/ShellId";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A shell's bytes as the terminal draws them, never an agent event, so a shell never enters a session's event log
export interface ShellOutputMessage extends BaseServerMessage<ServerMessageType.ShellOutput>, ShellId {
  data: string;
}

export const shellOutputMessageSchema: z.ZodObject<{
  data: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.ShellOutput>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.ShellOutput)).shape,
  ...shellIdSchema.shape,
  data: z.string(),
}) satisfies z.ZodType<ShellOutputMessage>;
