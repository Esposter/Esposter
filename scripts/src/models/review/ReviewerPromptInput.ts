export interface ReviewerPromptInput {
  base: string;
  diff: string;
  end: string;
  files: string[];
  isDiffCut: boolean;
}
