export interface PortResult {
  // The candidate's file count from the develop head, read from the tree after the last pick
  fileCount: number;
  fixCount: number;
  // The first queue commit the window could not take — a conflict or the cap — when one exists
  heldSha: string | undefined;
  // Set when the window is a pure prefix of the queue sitting on develop, so `develop` can move to the queue's
  // Own sha and the session owes no rebase
  isFastForward: boolean;
  queueShas: string[];
}
