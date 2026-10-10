// Where a transcript sits: a workflow agent's run, a subagent a session spawned, or the session itself
export enum UsageBucket {
  Main = "main",
  Subagent = "subagent",
  Workflow = "workflow",
}
