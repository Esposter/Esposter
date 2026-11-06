import type { SurveyDocument } from "vue-survey-engine-headless";

import { parseJsonPointer, readJsonValue } from "@esposter/shared";

// How many elements a slot holds, so a new element placed at the slot's end lands after the last of them
export const getSurveySlotLength = (document: SurveyDocument, slotPointer: string): number => {
  const elements = readJsonValue(document, parseJsonPointer(slotPointer));
  return Array.isArray(elements) ? elements.length : 0;
};
