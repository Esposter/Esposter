export interface PortInput {
  cwd: string;
  developSha: string;
  // What the fixes branch still owes develop, read once by the caller — the window is built on top of them
  // The last sha a review body named, which is where the next review starts reading — never the develop head,
  // Which runs ahead of it whenever a pushed window has not been reviewed yet
  fixShas: string[];
  frontierSha: string;
  queueSha: string;
}
