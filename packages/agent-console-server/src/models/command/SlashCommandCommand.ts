import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface SlashCommandCommand extends BaseCommand<CommandType.SlashCommand>, SessionId {
  arguments: string;
  name: string;
}

export const slashCommandCommandSchema: z.ZodObject<{
  arguments: z.ZodString;
  id: z.ZodString;
  name: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.SlashCommand>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.SlashCommand)).shape,
  ...sessionIdSchema.shape,
  arguments: z.string(),
  name: z.string().min(1),
}) satisfies z.ZodType<SlashCommandCommand>;
