export interface PortInput {
  cwd: string;
  developSha: string;
  // What the fixes branch still owes develop, read once by the caller — the window is built on top of them
  fixShas: string[];
  // `main`'s merge base with `develop`, where the release's one review starts reading — never the develop head,
  // Which runs ahead of it whenever a pushed window has not been opened yet
  mergeBaseSha: string;
  queueSha: string;
}
