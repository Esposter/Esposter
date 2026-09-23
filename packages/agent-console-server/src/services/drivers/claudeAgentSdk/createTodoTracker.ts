import type { TodoTracker } from "#src/models/claudeAgentSdk/TodoTracker";
import type { Todo } from "#src/models/event/Todo";
import type { TodoUpdateEvent } from "#src/models/event/TodoUpdateEvent";
import type { ToolResultEvent } from "#src/models/event/ToolResultEvent";
import type { ToolUseEvent } from "#src/models/event/ToolUseEvent";

import { TodoToolName } from "#src/models/claudeAgentSdk/TodoToolName";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { TodoStatus, todoStatusSchema } from "#src/models/event/TodoStatus";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { z } from "zod";

const todoWriteInputSchema = z.object({
  todos: z.object({ activeForm: z.string(), content: z.string(), status: todoStatusSchema }).array(),
});
const taskCreateInputSchema = z.object({ activeForm: z.string().optional(), subject: z.string() });
const taskCreateResultSchema = z.object({ task: z.object({ id: z.string().min(1) }) });
const taskUpdateInputSchema = z.object({
  activeForm: z.string().optional(),
  status: z.union([todoStatusSchema, z.literal("deleted")]).optional(),
  subject: z.string().optional(),
  taskId: z.string().min(1),
});
// The main agent's checklist, rebuilt from its todo tool calls. A subagent's own list is its business and never
// Replaces the one the person is following.
export const createTodoTracker = (): TodoTracker => {
  let todos: Todo[] = [];
  const pendingTodoMap = new Map<string, Pick<Todo, "activeForm" | "content" | "status">>();
  const toTodoUpdateEvent = (sourceId: string, createdAt: Date): TodoUpdateEvent => ({
    createdAt,
    id: getEventId(sourceId, AgentEventType.TodoUpdate),
    todos,
    type: AgentEventType.TodoUpdate,
  });

  return {
    readToolResult: (event: ToolResultEvent, toolUseResult: unknown): TodoUpdateEvent | undefined => {
      const pendingTodo = pendingTodoMap.get(event.toolUseId);
      if (!pendingTodo) return undefined;

      pendingTodoMap.delete(event.toolUseId);
      const taskCreateResult = taskCreateResultSchema.safeParse(toolUseResult);
      if (!taskCreateResult.success || event.isError) return undefined;

      todos = [...todos, { ...pendingTodo, id: taskCreateResult.data.task.id }];
      return toTodoUpdateEvent(event.id, event.createdAt);
    },
    readToolUse: (event: ToolUseEvent): TodoUpdateEvent | undefined => {
      if (event.parentToolUseId) return undefined;

      switch (event.name) {
        case TodoToolName.TaskCreate: {
          const input = taskCreateInputSchema.safeParse(event.input);
          if (!input.success) return undefined;

          const { activeForm, subject } = input.data;
          pendingTodoMap.set(event.toolUseId, {
            activeForm: activeForm ?? subject,
            content: subject,
            status: TodoStatus.Pending,
          });
          return undefined;
        }
        case TodoToolName.TaskUpdate: {
          const input = taskUpdateInputSchema.safeParse(event.input);
          if (!input.success) return undefined;

          const { activeForm, status, subject, taskId } = input.data;
          todos =
            status === "deleted"
              ? todos.filter(({ id }) => id !== taskId)
              : todos.map((todo) =>
                  todo.id === taskId
                    ? {
                        activeForm: activeForm ?? todo.activeForm,
                        content: subject ?? todo.content,
                        id: todo.id,
                        status: status ?? todo.status,
                      }
                    : todo,
                );
          return toTodoUpdateEvent(event.id, event.createdAt);
        }
        case TodoToolName.TodoWrite: {
          const input = todoWriteInputSchema.safeParse(event.input);
          if (!input.success) return undefined;

          todos = input.data.todos.map(({ activeForm, content, status }, index) => ({
            activeForm,
            content,
            id: String(index),
            status,
          }));
          return toTodoUpdateEvent(event.id, event.createdAt);
        }
        default:
          return undefined;
      }
    },
  };
};
