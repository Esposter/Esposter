import type { Attachment } from "#src/models/command/Attachment";
import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { attachmentSchema } from "#src/models/command/Attachment";
import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface PromptCommand extends BaseCommand<CommandType.Prompt>, SessionId {
  attachments: Attachment[];
  text: string;
}

export const promptCommandSchema: z.ZodObject<{
  attachments: z.ZodArray<typeof attachmentSchema>;
  id: z.ZodString;
  sessionId: z.ZodString;
  text: z.ZodString;
  type: z.ZodLiteral<CommandType.Prompt>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.Prompt)).shape,
  ...sessionIdSchema.shape,
  attachments: attachmentSchema.array(),
  text: z.string(),
}) satisfies z.ZodType<PromptCommand>;
