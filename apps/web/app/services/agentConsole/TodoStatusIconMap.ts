import { TodoStatus } from "agent-console-server/contracts";

export const TodoStatusIconMap = {
  [TodoStatus.Completed]: "mdi-checkbox-marked-circle-outline",
  [TodoStatus.InProgress]: "mdi-progress-clock",
  [TodoStatus.Pending]: "mdi-checkbox-blank-circle-outline",
} as const satisfies Record<TodoStatus, string>;
