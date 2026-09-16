export interface FoldPromptInput {
  // The paths the merge stopped on, and `main`'s head being folded in
  conflictedPaths: string[];
  mainSha: string;
}
