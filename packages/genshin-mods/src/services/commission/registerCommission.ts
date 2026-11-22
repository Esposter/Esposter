import type { On } from "claude-code";

import { TaskTool } from "../../models/TaskTool";
import { checkIsAnswered } from "./checkIsAnswered";
import { foldCommission } from "./foldCommission";

export const registerCommission = (on: On): void => {
  on("tool.call", { tool: "TaskCreate" }, async ($, e, next) => {
    const result = await next(e);
    // Its check does not narrow, so the errored variant's unknown result is narrowed out here for the task's id
    if (checkIsAnswered(result) && !result.isError && result.result)
      await foldCommission($, { id: result.result.task.id, subject: e.subject, tool: TaskTool.TaskCreate });
    return result;
  });

  on("tool.call", { tool: "TaskUpdate" }, async ($, e, next) => {
    const result = await next(e);
    if (checkIsAnswered(result))
      await foldCommission($, { id: e.taskId, status: e.status, subject: e.subject, tool: TaskTool.TaskUpdate });
    return result;
  });

  on("tool.call", { tool: "TodoWrite" }, async ($, e, next) => {
    const result = await next(e);
    if (checkIsAnswered(result)) await foldCommission($, { todos: e.todos, tool: TaskTool.TodoWrite });
    return result;
  });
};
