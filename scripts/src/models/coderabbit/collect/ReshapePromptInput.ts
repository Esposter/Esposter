export interface ReshapePromptInput {
  // How many files the commit changes alone, against the cap
  fileCount: number;
  sha: string;
}
