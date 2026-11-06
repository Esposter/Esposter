import type { SurveyAnswers, SurveyAnswerValue } from "vue-survey-engine-headless";

// A row's record with one answer set, or cleared when the answer is absent, so a cleared answer leaves no key behind
export const withSurveyAnswer = (
  row: SurveyAnswers,
  name: string,
  value: SurveyAnswerValue | undefined,
): SurveyAnswers => {
  if (value !== undefined) return { ...row, [name]: value };

  return Object.fromEntries(Object.entries(row).filter(([key]) => key !== name));
};
