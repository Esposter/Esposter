export interface TaskRegistry {
  // Resolves once every task run so far has finished — what the host's shutdown waits on
  drain: () => Promise<void>;
  // Starts a task nothing awaits; the task terminates its own failures and never rejects
  run: (task: () => Promise<void>) => void;
}
