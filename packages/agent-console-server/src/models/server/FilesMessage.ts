import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { z } from "zod";

// The files a session can name, relative to its working directory, answering a list files command
export interface FilesMessage extends BaseServerMessage<ServerMessageType.Files> {
  commandId: string;
  files: string[];
}

export const filesMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  files: z.ZodArray<z.ZodString>;
  type: z.ZodLiteral<ServerMessageType.Files>;
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Files)).shape,
  commandId: z.string().min(1),
  files: z.array(z.string()),
}) satisfies z.ZodType<FilesMessage>;
