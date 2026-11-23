import type { SurveyQuestionBaseProps } from "vue-survey-engine-headless";

import { checkIsBlankText } from "@esposter/shared";

// A question's or an item's title as a respondent reads it: its title, or its name where the title is blank
export const getSurveyQuestionTitle = ({ name, title }: Pick<SurveyQuestionBaseProps, "name" | "title">): string =>
  checkIsBlankText(title) ? name : title;
