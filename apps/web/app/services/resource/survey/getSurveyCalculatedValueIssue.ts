import type { SurveyCalculatedValue, SurveyDocument } from "vue-survey-engine-headless";

import { SURVEY_CALCULATED_VALUES_POINTER } from "@/services/resource/survey/constants";
import { checkSurveyDocument } from "vue-survey-engine-headless";

// The message the survey check gives the calculated value at an index, checked on the document as it would be with these
// Values in place of its own. A value's issue is named at its pointer or beneath it
export const getSurveyCalculatedValueIssue = (
  document: SurveyDocument,
  calculatedValues: SurveyCalculatedValue[],
  index: number,
): string | undefined => {
  const pointer = `${SURVEY_CALCULATED_VALUES_POINTER}/${index}`;
  const wouldBe: SurveyDocument = {
    ...document,
    root: { ...document.root, props: { ...document.root.props, calculatedValues } },
  };
  const issue = checkSurveyDocument(wouldBe).find(
    ({ pointer: issuePointer }) => issuePointer === pointer || issuePointer.startsWith(`${pointer}/`),
  );
  return issue?.message;
};
