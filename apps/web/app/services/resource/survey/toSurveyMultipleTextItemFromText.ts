import type { SurveyMultipleTextItem } from "survey-engine";

import { SurveyMultipleTextItemInputType } from "survey-engine";

// The item a typed name makes: a text input whose name and title are the name, trimmed, which the owner can then change.
// Blank text makes no item
export const toSurveyMultipleTextItemFromText = (text: string): SurveyMultipleTextItem | undefined => {
  const name = text.trim();
  if (name === "") return undefined;

  return { inputType: SurveyMultipleTextItemInputType.Text, isRequired: false, name, title: name };
};
