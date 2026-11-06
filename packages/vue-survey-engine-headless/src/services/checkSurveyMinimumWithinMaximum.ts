import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

// A minimum above its maximum leaves no count that meets both, so the question it bounds could never be answered
export const checkSurveyMinimumWithinMaximum = (
  minimum: number | undefined,
  maximum: number | undefined,
  minimumPointer: string,
  issues: SurveyDocumentIssue[],
): void => {
  if (minimum !== undefined && maximum !== undefined && minimum > maximum)
    issues.push({
      message: `The minimum ${minimum} is above the maximum ${maximum}, so no answer could meet both`,
      pointer: minimumPointer,
    });
};
