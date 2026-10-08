export interface OpenWindowInput {
  // The pull request's base: the window below it, or `main` for the bottom of the stack
  baseBranch: string;
  // The sha the window's own commits are listed from: the top of the stack, or `main` when none is open
  baseSha: string;
  cwd: string;
  // The `develop` head the window is pushed over — the lease the fast-forward is refused against if it moved
  developSha: string;
  isDryRun: boolean;
  // The head the window is cut at, which is what `develop` is fast-forwarded to
  targetSha: string;
  windowNumber: number;
}
