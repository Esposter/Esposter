import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A shell's bytes as the terminal draws them, never an agent event, so a shell never enters a session's event log
export interface ShellOutputMessage extends BaseServerMessage<ServerMessageType.ShellOutput> {
  data: string;
  shellId: string;
}

export const shellOutputMessageSchema: z.ZodObject<{
  data: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.ShellOutput>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.ShellOutput)).shape,
  data: z.string(),
  shellId: z.string().min(1),
}) satisfies z.ZodType<ShellOutputMessage>;
