import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { z } from "zod";

// The files put back as they were when the prompt under the message uuid was sent, from the checkpoints the session
// Keeps before every edit
export interface FileRewindEvent extends BaseAgentEvent<AgentEventType.FileRewind>, MessageUuid {
  deletions: number;
  filePaths: string[];
  insertions: number;
}

export const fileRewindEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  deletions: z.ZodInt;
  filePaths: z.ZodArray<z.ZodString>;
  id: z.ZodString;
  insertions: z.ZodInt;
  messageUuid: z.ZodString;
  type: z.ZodLiteral<AgentEventType.FileRewind>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.FileRewind)).shape,
  ...messageUuidSchema.shape,
  deletions: z.int().nonnegative(),
  filePaths: z.string().array(),
  insertions: z.int().nonnegative(),
}) satisfies z.ZodType<FileRewindEvent>;
