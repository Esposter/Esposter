import type { SurveyMultipleTextItem } from "vue-survey-engine-headless";

import { normalizeString } from "@esposter/shared";
import { SurveyMultipleTextItemInputType } from "vue-survey-engine-headless";

// The item a typed name makes: a text input whose name and title are the name, trimmed, which the owner can then change.
// Blank text makes no item
export const toSurveyMultipleTextItemFromText = (text: string): SurveyMultipleTextItem | undefined => {
  const name = normalizeString(text);
  if (!name) return undefined;

  return { inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name, title: name };
};
