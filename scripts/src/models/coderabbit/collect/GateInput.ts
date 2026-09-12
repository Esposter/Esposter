import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

export interface GateInput {
  checkStatus: CheckStatus | undefined;
  developSha: string;
  lastReviewedSha: string | undefined;
}
