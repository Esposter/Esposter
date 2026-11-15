// The engine's own task statuses, as its task tools spell them
export const TaskStatus = { Completed: "completed", InProgress: "in_progress", Pending: "pending" } as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
