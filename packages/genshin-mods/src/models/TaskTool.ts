export const TaskTool = { TaskCreate: "TaskCreate", TaskUpdate: "TaskUpdate", TodoWrite: "TodoWrite" } as const;
export type TaskTool = (typeof TaskTool)[keyof typeof TaskTool];
