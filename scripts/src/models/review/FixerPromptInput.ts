import type { ReviewFinding } from "#src/models/review/ReviewFinding";

export interface FixerPromptInput {
  base: string;
  end: string;
  findings: ReviewFinding[];
}
