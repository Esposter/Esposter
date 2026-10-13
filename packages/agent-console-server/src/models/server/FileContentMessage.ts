import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// A file's text answering a read file command. A file the view cannot show carries its reason in notice and no content
export interface FileContentMessage extends BaseServerMessage<ServerMessageType.FileContent> {
  commandId: string;
  content: string;
  // Empty when the file is shown, else why it is not: too large, or not text
  notice: string;
  path: string;
}

export const fileContentMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  content: z.ZodString;
  notice: z.ZodString;
  path: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.FileContent>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.FileContent)).shape,
  commandId: z.string().min(1),
  content: z.string(),
  notice: z.string(),
  path: z.string().min(1),
}) satisfies z.ZodType<FileContentMessage>;
