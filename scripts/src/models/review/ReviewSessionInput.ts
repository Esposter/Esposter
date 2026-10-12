import type { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";

// What one session runs over: its checkout, its prompt, the role that sets its tools, and its wall clock
export interface ReviewSessionInput {
  cwd: string;
  prompt: string;
  role: ReviewSessionRole;
  timeoutMs: number;
}
