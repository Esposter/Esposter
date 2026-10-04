export interface ReshapePromptInput {
  // How many files the commit changes alone
  fileCount: number;
  // How many files a window has room for beside the fixes and pending commits it carries ahead of the queue
  roomFileCount: number;
  sha: string;
}
