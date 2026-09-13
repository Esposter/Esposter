export interface PortResult {
  // The candidate's file count from the frontier, read from the tree after the last pick
  fileCount: number;
  fixCount: number;
  // The first queue commit the window could not take — a conflict or the cap — when one exists
  heldSha?: string;
  // Set when the window is a pure prefix of the queue sitting on develop, so `develop` can move to the queue's
  // Own sha and the session owes no rebase
  isFastForward: boolean;
  // `main` had commits develop lacked and the fold conflicted outside the lockfile — left for a person, distinct
  // From nothing needing a fold at all
  isMainConflicted: boolean;
  // Whether `main` had commits develop lacked and was folded into the candidate as a merge commit
  isMainMerged: boolean;
  queueShas: string[];
}
