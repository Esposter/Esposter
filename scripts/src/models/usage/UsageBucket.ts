// Where a transcript sits: a workflow agent's run, a subagent a session spawned, or the session itself
export const UsageBucket = { Main: "main", Subagent: "subagent", Workflow: "workflow" } as const;
export type UsageBucket = (typeof UsageBucket)[keyof typeof UsageBucket];
