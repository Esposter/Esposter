import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

export interface GateInput {
  checkStatus?: CheckStatus;
  developSha: string;
  lastReviewedSha?: string;
}
