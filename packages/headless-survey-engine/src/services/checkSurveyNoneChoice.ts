import type { SurveyChoicesProps } from "#src/models/SurveyChoicesProps";
import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";
import type { SurveyNoneChoiceProps } from "#src/models/SurveyNoneChoiceProps";

import { SURVEY_NONE_ANSWER } from "#src/services/runner/constants";
import { getBlockPropPointer } from "vue-block-editor-headless";

// The none answer is the one answer that is no choice's value, so a question that offers none may not give a choice that value
export const checkSurveyNoneChoice = (
  props: SurveyChoicesProps & SurveyNoneChoiceProps,
  nodePointer: string,
  issues: SurveyDocumentIssue[],
): void => {
  if (props.hasNone && props.choices.some(({ value }) => value === SURVEY_NONE_ANSWER))
    issues.push({
      message: `A choice may not take the value "${SURVEY_NONE_ANSWER}", since the question offers none under it`,
      pointer: getBlockPropPointer(nodePointer, "choices"),
    });
};
