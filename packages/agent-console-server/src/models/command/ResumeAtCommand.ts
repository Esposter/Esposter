import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface ResumeAtCommand extends BaseCommand<CommandType.ResumeAt>, SessionId {
  messageUuid: string;
}

export const resumeAtCommandSchema: z.ZodObject<{
  id: z.ZodString;
  messageUuid: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.ResumeAt>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.ResumeAt)).shape,
  ...sessionIdSchema.shape,
  messageUuid: z.string().min(1),
}) satisfies z.ZodType<ResumeAtCommand>;
