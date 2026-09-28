import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { z } from "zod";

// The window's session is about to open under this id — the driver's onSessionOpen
export interface ChildSessionOpenMessage extends BaseChildMessage<ChildMessageType.SessionOpen> {
  sessionId: string;
}

export const childSessionOpenMessageSchema: z.ZodObject<{
  sessionId: z.ZodString;
  type: z.ZodLiteral<ChildMessageType.SessionOpen>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.SessionOpen)).shape,
  sessionId: z.string().min(1),
}) satisfies z.ZodType<ChildSessionOpenMessage>;
