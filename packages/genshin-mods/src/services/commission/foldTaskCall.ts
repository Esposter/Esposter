import type { CommissionTask } from "../../../types";
import type { TaskCall } from "../../models/TaskCall";

import { TaskTool } from "../../models/TaskTool";

const DELETED_STATUS = "deleted";

export const foldTaskCall = (tasks: CommissionTask[], call: TaskCall): CommissionTask[] => {
  switch (call.tool) {
    case TaskTool.TaskCreate:
      return [...tasks, { id: call.id, status: "pending", subject: call.subject }];
    case TaskTool.TaskUpdate: {
      const { id, status, subject } = call;
      if (status === DELETED_STATUS) return tasks.filter((task) => task.id !== id);
      else
        return tasks.map((task) =>
          task.id === id ? { ...task, status: status ?? task.status, subject: subject ?? task.subject } : task,
        );
    }
    // A todo list carries no ids and is written whole each time, so its place in the list is its id
    case TaskTool.TodoWrite:
      return call.todos.map(({ content, status }, index) => ({ id: `${index}`, status, subject: content }));
    default:
      return tasks;
  }
};
