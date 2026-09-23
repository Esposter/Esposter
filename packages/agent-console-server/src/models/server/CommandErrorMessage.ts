import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

export interface CommandErrorMessage extends BaseServerMessage<ServerMessageType.CommandError> {
  // Empty when the command could not be read far enough to have one
  commandId: string;
  message: string;
}

export const commandErrorMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  message: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.CommandError>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.CommandError)).shape,
  commandId: z.string(),
  message: z.string().min(1),
}) satisfies z.ZodType<CommandErrorMessage>;
