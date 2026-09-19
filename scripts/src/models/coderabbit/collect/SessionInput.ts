import type { SessionModel } from "#src/models/coderabbit/collect/SessionModel";

export interface SessionInput {
  cwd: string;
  // Read off `SessionRoleModelMap` by the role launching this session, which is the only thing that prices one
  model: SessionModel;
  prompt: string;
}
