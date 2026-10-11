import type { SessionModel } from "#src/models/coderabbit/collect/SessionModel";

export interface SessionInput {
  cwd: string;
  // Read off `SessionRoleModelMap` by the role launching this session, which is the only thing that prices one
  model: SessionModel;
  prompt: string;
  // A deadline sooner than `SESSION_TIMEOUT_MS`, which every session gets. The launcher cannot read how long it allows,
  // So a collector step handing one budgets it against the run's itself (`assertCycleBudget`)
  signal?: AbortSignal;
}
