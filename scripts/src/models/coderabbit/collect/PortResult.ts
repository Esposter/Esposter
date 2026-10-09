export interface PortResult {
  // The candidate's file count from the window's base, read from the tree after the last pick
  fileCount: number;
  fixCount: number;
  // The first fix or queue commit the window could not take — a conflict or the cap — when one exists. A held fix
  // Leaves the window the fixes before it, with no queue commit behind them
  heldSha?: string;
  queueShas: string[];
}
