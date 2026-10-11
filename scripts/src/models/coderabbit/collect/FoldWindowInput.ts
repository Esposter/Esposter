import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface FoldWindowInput {
  collectorSha: string;
  cwd: string;
  // The head the review covers — the window's own branch head for the bottom of the stack
  headSha: string;
  isDryRun: boolean;
  // The lease the fold's push is refused against if `main` left it
  mainSha: string;
  viewerLogin: string;
  // The bottom window, cut again without the commits that conflict when the fold is past the resolver's attempts
  window: WindowPullRequest;
}
