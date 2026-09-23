// The tools a Claude Code build keeps its checklist with: one list rewritten whole, or tasks made and patched
// One at a time. Which one a build offers varies, so the console follows both.
export enum TodoToolName {
  TaskCreate = "TaskCreate",
  TaskUpdate = "TaskUpdate",
  TodoWrite = "TodoWrite",
}
