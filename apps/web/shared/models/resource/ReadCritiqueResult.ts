import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";

// The critique of a resource's saved content, with the content version it was read at, so a reader knows which save it
// Answers
export interface ReadCritiqueResult {
  contentVersion: number;
  findings: CritiqueFinding[];
}
