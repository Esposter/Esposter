import type { SurveyQuestionBaseProps } from "vue-survey-engine-headless";

// A question's title as a respondent reads it: its title, or its name where the question has none
export const getSurveyQuestionTitle = ({ name, title }: Pick<SurveyQuestionBaseProps, "name" | "title">): string =>
  title || name;
