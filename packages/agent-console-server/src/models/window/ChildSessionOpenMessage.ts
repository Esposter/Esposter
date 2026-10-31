import type { SessionId } from "#src/models/command/SessionId";
import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { sessionIdSchema } from "#src/models/command/SessionId";
import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { z } from "zod";

// The window's session is about to open under this id — the driver's onSessionOpen
export interface ChildSessionOpenMessage extends BaseChildMessage<ChildMessageType.SessionOpen>, SessionId {
  isSideChat: boolean;
}

export const childSessionOpenMessageSchema: z.ZodObject<{
  isSideChat: z.ZodBoolean;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ChildMessageType.SessionOpen>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.SessionOpen)).shape,
  ...sessionIdSchema.shape,
  isSideChat: z.boolean(),
}) satisfies z.ZodType<ChildSessionOpenMessage>;
