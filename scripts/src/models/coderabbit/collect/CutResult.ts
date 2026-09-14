export interface CutResult {
  // The queue commits the green cut kept, in queue order — a prefix of what the port picked
  queueShas: string[];
  // What is pushed to `develop`: the queue's own sha on a fast-forward, the candidate head otherwise
  targetSha: string;
}
