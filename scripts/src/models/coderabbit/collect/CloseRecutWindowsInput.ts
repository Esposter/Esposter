import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface CloseRecutWindowsInput {
  cwd: string;
  // The `develop` head the run read, which the move back is leased on
  developSha: string;
  // The cap the windows' replacement is cut to, left on every window closed (`readRecutFileCaps`)
  fileCap: number;
  isDryRun: boolean;
  // Why the windows are cut again, the clause every window closed is told
  reason: string;
  // Where `develop` moves back to: below the lowest window closed, so it carries none of them
  targetSha: string;
  // The windows closed, bottom up
  windows: WindowPullRequest[];
}
