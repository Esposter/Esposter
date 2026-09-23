import type { TodoUpdateEvent } from "#src/models/event/TodoUpdateEvent";
import type { ToolResultEvent } from "#src/models/event/ToolResultEvent";
import type { ToolUseEvent } from "#src/models/event/ToolUseEvent";

export interface TodoTracker {
  readToolResult: (event: ToolResultEvent, toolUseResult: unknown) => TodoUpdateEvent | undefined;
  readToolUse: (event: ToolUseEvent) => TodoUpdateEvent | undefined;
}
