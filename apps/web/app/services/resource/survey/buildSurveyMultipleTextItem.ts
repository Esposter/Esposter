import type { SurveyMultipleTextItem } from "survey-engine";

import { normalizeString } from "@esposter/shared";
import { SurveyMultipleTextItemInputType } from "survey-engine";

// The item a typed name makes, its trimmed text both its name and its title, with a text input that is not required
export const buildSurveyMultipleTextItem = (text: string): SurveyMultipleTextItem => {
  const trimmedText = normalizeString(text);
  return { inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name: trimmedText, title: trimmedText };
};
