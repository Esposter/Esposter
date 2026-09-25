import { TodoStatus } from "agent-console-server/contracts";

// A checklist item's box as the terminal draws it
export const TodoStatusMarkMap = {
  [TodoStatus.Completed]: "[x]",
  [TodoStatus.InProgress]: "[~]",
  [TodoStatus.Pending]: "[ ]",
} as const satisfies Record<TodoStatus, string>;
