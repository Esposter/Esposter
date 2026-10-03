export enum TaskTool {
  TaskCreate = "TaskCreate",
  TaskUpdate = "TaskUpdate",
  TodoWrite = "TodoWrite",
}

export const TaskTools: readonly TaskTool[] = Object.values(TaskTool);
