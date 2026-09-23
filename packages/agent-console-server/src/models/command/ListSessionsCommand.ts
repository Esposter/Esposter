import type { BaseCommand } from "#src/models/command/BaseCommand";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { z } from "zod";

export interface ListSessionsCommand extends BaseCommand<CommandType.ListSessions> {}

export const listSessionsCommandSchema: z.ZodObject<{ id: z.ZodString; type: z.ZodLiteral<CommandType.ListSessions> }> =
  z.object({
    ...createBaseCommandSchema(z.literal(CommandType.ListSessions)).shape,
  }) satisfies z.ZodType<ListSessionsCommand>;
