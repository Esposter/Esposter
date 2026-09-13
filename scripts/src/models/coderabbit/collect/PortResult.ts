export interface PortResult {
  // The candidate's file count from the frontier, read from the tree after the last pick
  fileCount: number;
  fixCount: number;
  // The first queue commit the window could not take — a conflict or the cap — when one exists
  heldSha?: string;
  queueShas: string[];
}
