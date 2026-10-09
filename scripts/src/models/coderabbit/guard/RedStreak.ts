import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

// The red the newest collector runs all failed on, and when the oldest run of that streak was created, which bounds the
// Span a run hidden inside it is looked for in
export interface RedStreak {
  createdAt: string;
  signature: FailureSignature;
}
