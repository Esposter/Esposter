export const SurveyResponseDatasetColumnName = { Respondent: "respondent", SubmittedAt: "submittedAt" } as const;
export type SurveyResponseDatasetColumnName =
  (typeof SurveyResponseDatasetColumnName)[keyof typeof SurveyResponseDatasetColumnName];
