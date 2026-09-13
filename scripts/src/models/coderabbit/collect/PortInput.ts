export interface PortInput {
  cwd: string;
  developSha: string;
  // The last sha a review body named, which is where the next review starts reading — never the develop head,
  // Which runs ahead of it whenever a pushed window has not been reviewed yet
  frontierSha: string;
  queueSha: string;
  reviewFixesSha?: string;
}
