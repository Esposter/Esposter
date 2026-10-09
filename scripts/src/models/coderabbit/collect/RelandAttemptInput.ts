import type { HeldCommit } from "#src/models/coderabbit/collect/HeldCommit";

export interface RelandAttemptInput extends HeldCommit {
  cwd: string;
  // The queue's head the commit is picked onto
  queueSha: string;
}
