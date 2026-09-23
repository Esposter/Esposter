import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

export interface GateInput {
  checkStatus?: CheckStatus;
  developSha: string;
  // The bot's walkthrough carries its skipped-review section
  isReviewSkipped: boolean;
  lastReviewedSha?: string;
}
