import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { Todo } from "#src/models/event/Todo";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { todoSchema } from "#src/models/event/Todo";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface TodoUpdateEvent extends BaseAgentEvent<AgentEventType.TodoUpdate> {
  todos: Todo[];
}

export const todoUpdateEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  todos: z.ZodArray<typeof todoSchema>;
  type: z.ZodLiteral<AgentEventType.TodoUpdate>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.TodoUpdate)).shape,
  todos: createUniqueArraySchema(todoSchema, "id"),
}) satisfies z.ZodType<TodoUpdateEvent>;
