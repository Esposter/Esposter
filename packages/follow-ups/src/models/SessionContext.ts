// What a session passes to the follow-up tools unchanged, since no tool call can see which session made it
export interface SessionContext {
  listId: string;
  // "" in a folder with no origin remote, where no follow-up is written since nothing could drain it
  repository: string;
  sessionId: string;
  timeZone: string;
}
