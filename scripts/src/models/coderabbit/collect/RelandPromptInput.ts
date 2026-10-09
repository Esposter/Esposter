import type { HeldCommit } from "#src/models/coderabbit/collect/HeldCommit";

export interface RelandPromptInput extends HeldCommit {
  // The paths the pick stopped on
  conflictedPaths: string[];
}
