import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { ImageAttachment } from "#src/models/command/ImageAttachment";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { imageAttachmentSchema } from "#src/models/command/ImageAttachment";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface PromptCommand extends BaseCommand<CommandType.Prompt>, SessionId {
  images: ImageAttachment[];
  text: string;
}

export const promptCommandSchema: z.ZodObject<{
  id: z.ZodString;
  images: z.ZodArray<typeof imageAttachmentSchema>;
  sessionId: z.ZodString;
  text: z.ZodString;
  type: z.ZodLiteral<CommandType.Prompt>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.Prompt)).shape,
  ...sessionIdSchema.shape,
  images: imageAttachmentSchema.array(),
  text: z.string(),
}) satisfies z.ZodType<PromptCommand>;
