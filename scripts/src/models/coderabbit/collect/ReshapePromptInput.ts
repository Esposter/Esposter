export interface ReshapePromptInput {
  // The globs the base's path filters leave out of the review, so the split is made on the files it counts
  excludedGlobs: string[];
  // The file cap the window is cut to
  fileCap: number;
  // How many files the review counts in the commit alone
  fileCount: number;
  // How many files a window has room for beside the fixes and pending commits it carries ahead of the queue
  roomFileCount: number;
  sha: string;
}
