import type { SurveyAnswers, SurveyAnswerValue } from "survey-engine";

// A list answer's rows, each the record of one row's answers. A row that holds no record reads as an empty one.
// A list with no answer yet holds `count` empty rows, so a row keeps its place in the list whatever its answers hold
export const getSurveyAnswerRows = (answer: SurveyAnswerValue | undefined, count: number): SurveyAnswers[] => {
  if (!Array.isArray(answer)) return Array.from({ length: count }, () => ({}));

  return answer.map((row) => (typeof row === "object" && !Array.isArray(row) ? row : {}));
};
