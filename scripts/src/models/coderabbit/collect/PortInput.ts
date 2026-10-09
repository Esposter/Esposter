export interface PortInput {
  // The base the bot reviews the window against: `main`'s tip, or the head of the window below when one is open. Every
  // Count is taken from it, never from the develop head, which runs ahead of it whenever a pushed window is not open yet
  baseSha: string;
  cwd: string;
  developSha: string;
  // The file cap this window is cut to — `REVIEW_FILE_CAP`, or less for a window re-cut after the bot kept skipping it
  fileCap: number;
  // What the fixes branch still owes develop, read once by the caller — the window is built on top of them
  fixShas: string[];
  queueSha: string;
}
