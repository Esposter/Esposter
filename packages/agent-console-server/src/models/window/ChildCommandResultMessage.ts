import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { z } from "zod";

// A forwarded command finished: an opening command with the session it opened, any other with an empty id
export interface ChildCommandResultMessage extends BaseChildMessage<ChildMessageType.CommandResult> {
  commandId: string;
  sessionId: string;
}

export const childCommandResultMessageSchema: z.ZodObject<{
  commandId: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ChildMessageType.CommandResult>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.CommandResult)).shape,
  commandId: z.string().min(1),
  sessionId: z.string(),
}) satisfies z.ZodType<ChildCommandResultMessage>;
