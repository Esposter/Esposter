import type { SurveyQuestionNode } from "vue-survey-engine-headless";

// The question as its field draws it while its title and description are edited on the surface: both are blanked, so the field draws neither
export const getSurveyFieldNode = <T extends SurveyQuestionNode>(question: T): T => ({
  ...question,
  props: { ...question.props, description: "", title: "" },
});
