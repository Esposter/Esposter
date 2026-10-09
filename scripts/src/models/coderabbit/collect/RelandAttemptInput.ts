import type { HeldCommit } from "#src/models/coderabbit/collect/HeldCommit";

export interface RelandAttemptInput extends HeldCommit {
  cwd: string;
  // Whether the copy takes the commit's own place in the queue, which still carries it — a claim rerouted to a window —
  // Rather than the queue's head
  isInPlace: boolean;
  // The queue's head, which the commit is picked onto, or what followed it is replayed from when it takes its place
  queueSha: string;
}
