import type { ReviewDisposition } from "#src/models/review/ReviewDisposition";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { reviewDispositionsAnswerSchema } from "#src/models/review/ReviewDispositionsAnswer";
import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";
import { FIXER_TIMEOUT_MS } from "#src/services/review/constants";
import { getFixerPrompt } from "#src/services/review/getFixerPrompt";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { runSession } from "#src/services/review/runSession";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// The one fixer session, in this checkout at the queue's tip. It is not retried: a fixer that fails defers every finding
// To the run's issue, which is the outcome a retry would only delay.
export const runFixer = async (base: string, end: string, findings: ReviewFinding[]): Promise<ReviewDisposition[]> => {
  const output = await runSession({
    cwd: REPOSITORY_ROOT,
    prompt: getFixerPrompt({ base, end, findings }),
    role: ReviewSessionRole.Fixer,
    timeoutMs: FIXER_TIMEOUT_MS,
  });
  return parseReviewAnswer(output, reviewDispositionsAnswerSchema).dispositions;
};
