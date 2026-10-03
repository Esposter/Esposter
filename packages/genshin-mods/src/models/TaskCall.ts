import type { CommissionTask } from "../../types";
import type { TaskTool } from "./TaskTool";

// One task tool call with what its result says, in the shapes the engine's own tools declare
export type TaskCall =
  | {
      id: string;
      // oxlint-disable-next-line literal-union/no-string-literal-union -- The engine's own TaskUpdate statuses
      status?: "deleted" | CommissionTask["status"];
      subject?: string;
      tool: TaskTool.TaskUpdate;
    }
  | { id: string; subject: string; tool: TaskTool.TaskCreate }
  | { todos: { content: string; status: CommissionTask["status"] }[]; tool: TaskTool.TodoWrite };
