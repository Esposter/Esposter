import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";
// Puts the files back as they were when the prompt under the message uuid was sent, leaving the conversation as it is
export interface RewindFilesCommand extends BaseCommand<CommandType.RewindFiles>, SessionId {
  messageUuid: string;
}

export const rewindFilesCommandSchema: z.ZodObject<{
  id: z.ZodString;
  messageUuid: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.RewindFiles>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.RewindFiles)).shape,
  ...sessionIdSchema.shape,
  messageUuid: z.string().min(1),
}) satisfies z.ZodType<RewindFilesCommand>;
