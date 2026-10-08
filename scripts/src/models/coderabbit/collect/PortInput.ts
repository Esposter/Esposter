export interface PortInput {
  cwd: string;
  developSha: string;
  // What the fixes branch still owes develop, read once by the caller — the window is built on top of them
  fixShas: string[];
  // The base the bot reviews the window against: `main`'s tip, or the head of the window below when one is open. Every
  // count is taken from it, never from the develop head, which runs ahead of it whenever a pushed window is not open yet
  baseSha: string;
  queueSha: string;
}
