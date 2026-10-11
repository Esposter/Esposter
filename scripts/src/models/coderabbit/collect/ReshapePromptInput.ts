import type { PathFilterGlobs } from "#src/models/coderabbit/collect/PathFilterGlobs";

// The base's path filter globs, so the split is made on the files the review counts
export interface ReshapePromptInput extends PathFilterGlobs {
  // The file cap the window is cut to
  fileCap: number;
  // How many files the review counts in the commit alone
  fileCount: number;
  // How many files a window has room for beside the fixes and pending commits it carries ahead of the queue
  roomFileCount: number;
  sha: string;
}
