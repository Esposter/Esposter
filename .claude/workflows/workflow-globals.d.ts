// Ambient declarations for the Workflow-tool sandbox globals, consumed only by the typecheck harness
// (typecheck.mjs) — the sandbox itself injects these at runtime and accepts plain JavaScript only.
interface WorkflowAgentOptions {
  agentType?: string;
  effort?: "high" | "low" | "max" | "medium" | "xhigh";
  isolation?: "worktree";
  label?: string;
  model?: string;
  phase?: string;
  schema?: object;
}

interface WorkflowBudget {
  remaining: () => number;
  spent: () => number;
  total: number | undefined;
}

declare const args: unknown;
declare const budget: WorkflowBudget;
declare function agent(prompt: string, options?: WorkflowAgentOptions): Promise<any>;
declare function log(message: string): void;
declare function parallel(thunks: ReadonlyArray<() => Promise<any>>): Promise<any[]>;
declare function phase(title: string): void;
declare function pipeline(
  items: readonly any[],
  ...stages: ((previousResult: any, originalItem: any, index: number) => any)[]
): Promise<any[]>;
declare function workflow(nameOrReference: string | { scriptPath: string }, workflowArgs?: any): Promise<any>;
