import type { SurveyElementView } from "#src/models/SurveyElementView";

import { SURVEY_UNNUMBERED_NODE_TYPES } from "#src/services/runner/constants";

// Questions are numbered in order across the survey, so a page carries on from the pages before it
export const numberSurveyQuestions = (views: SurveyElementView[], numbers: Map<string, number>): void => {
  for (const view of views) {
    // The next number is one past every question numbered so far
    if (!SURVEY_UNNUMBERED_NODE_TYPES.has(view.node.type)) numbers.set(view.pointer, numbers.size + 1);
    numberSurveyQuestions(view.children, numbers);
  }
};
