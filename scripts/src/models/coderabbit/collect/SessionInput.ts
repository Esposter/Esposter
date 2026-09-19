import type { SessionModel } from "#src/models/coderabbit/collect/SessionModel";

export interface SessionInput {
  cwd: string;
  // Read off `SessionRoleModelMap` by the role launching this session, or narrowed below it by a gate that
  // judged the work mechanical
  model: SessionModel;
  prompt: string;
}
