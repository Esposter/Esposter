import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";
import type { RejoiningSession } from "#src/models/window/RejoiningSession";

import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { rejoiningSessionSchema } from "#src/models/window/RejoiningSession";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A window whose host went away without ending its session, back with a host started since: every session it still
// Holds, each with its whole log, so the new host shows them as they are
export interface ChildRejoinMessage extends BaseChildMessage<ChildMessageType.Rejoin> {
  sessions: RejoiningSession[];
}

export const childRejoinMessageSchema: z.ZodObject<{
  sessions: z.ZodArray<typeof rejoiningSessionSchema>;
  type: z.ZodLiteral<ChildMessageType.Rejoin>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.Rejoin)).shape,
  sessions: createUniqueArraySchema(rejoiningSessionSchema, "sessionId"),
}) satisfies z.ZodType<ChildRejoinMessage>;
