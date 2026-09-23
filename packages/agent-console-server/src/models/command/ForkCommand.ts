import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface ForkCommand extends BaseCommand<CommandType.Fork>, SessionId {
  // The message the fork ends at, empty to fork the whole conversation
  messageUuid: string;
}

export const forkCommandSchema: z.ZodObject<{
  id: z.ZodString;
  messageUuid: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.Fork>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.Fork)).shape,
  ...sessionIdSchema.shape,
  messageUuid: z.string(),
}) satisfies z.ZodType<ForkCommand>;
