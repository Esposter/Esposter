import type { SessionModel } from "#src/models/coderabbit/collect/SessionModel";

export interface SessionInput {
  cwd: string;
  // Read off `SessionRoleModelMap` by the role launching this session, which is the only thing that prices one
  model: SessionModel;
  prompt: string;
  // A deadline for a session run outside the runner, whose job's timeout bounds every session it starts
  signal?: AbortSignal;
}
