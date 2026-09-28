import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { z } from "zod";

export interface ChildCommandErrorMessage extends BaseChildMessage<ChildMessageType.CommandError> {
  // Empty when the command could not be read far enough to have one
  commandId: string;
  message: string;
}

export const childCommandErrorMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  message: z.ZodString;
  type: z.ZodLiteral<ChildMessageType.CommandError>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.CommandError)).shape,
  commandId: z.string(),
  message: z.string().min(1),
}) satisfies z.ZodType<ChildCommandErrorMessage>;
