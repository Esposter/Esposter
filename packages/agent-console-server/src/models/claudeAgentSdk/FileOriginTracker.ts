import type { ToolResultEvent } from "#src/models/event/ToolResultEvent";

export interface FileOriginTracker {
  readToolResult: (event: ToolResultEvent, toolUseResult: unknown) => ToolResultEvent;
}
