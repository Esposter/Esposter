export interface CutResult {
  // Set when the window is a pure prefix of the queue sitting on develop, so `develop` can move to the queue's
  // Own sha and the session owes no rebase
  isFastForward: boolean;
  // `main` had commits develop lacked and the fold conflicted outside the lockfile — left for a person, distinct
  // From nothing needing a fold at all
  isMainConflicted: boolean;
  // Whether `main` had commits develop lacked and was folded into the candidate as a merge commit
  isMainMerged: boolean;
  // The queue commits the green cut kept, in queue order — a prefix of what the port picked
  queueShas: string[];
  // What is pushed to `develop`: the queue's own sha on a fast-forward, the candidate head otherwise
  targetSha: string;
}
