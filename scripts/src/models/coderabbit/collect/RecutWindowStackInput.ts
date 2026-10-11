import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface RecutWindowStackInput {
  cwd: string;
  // The cap the window's replacement is cut to, left on every window the re-cut closes (`readRecutFileCaps`)
  fileCap: number;
  isDryRun: boolean;
  // Why the window is cut again, the clause every window the re-cut closes is told
  reason: string;
  // The window cut again, with every open window stacked above it
  window: WindowPullRequest;
}
