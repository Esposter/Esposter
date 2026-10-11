import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

// A workflow run listed with the branch it ran for and the commit it read, GitHub's own spelling
export interface QueueCheck extends MainCheck {
  headBranch: string;
  headSha: string;
}
