import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { z } from "zod";

// The window's session changed in a way the list the page shows reflects — the driver's onSessionsChange
export interface ChildSessionsChangeMessage extends BaseChildMessage<ChildMessageType.SessionsChange> {}

export const childSessionsChangeMessageSchema: z.ZodObject<{ type: z.ZodLiteral<ChildMessageType.SessionsChange> }> =
  z.object({
    ...createBaseChildMessageSchema(z.literal(ChildMessageType.SessionsChange)).shape,
  }) satisfies z.ZodType<ChildSessionsChangeMessage>;
