export interface ReturnStrokeInput {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // Whether a window is open: develop is then the top of the stack, and carries what `main` does not yet
  isStackOpen: boolean;
  mainSha: string;
}
