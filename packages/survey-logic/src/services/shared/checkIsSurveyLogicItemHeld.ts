import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// Whether a haystack holds one needle item (R7, R11). A list holds an item equal to it, and a text holds it as an exact
// Substring. A number or a boolean holds it as its text, and a record holds nothing. An empty item is held by nothing, and
// So is a list or record item, since no text holds one
export const checkIsSurveyLogicItemHeld = (haystack: SurveyLogicValue, item: SurveyLogicValue): boolean => {
  if (checkIsSurveyLogicValueEmpty(item) || checkIsSurveyLogicValueEmpty(haystack)) return false;
  if (Array.isArray(haystack)) return haystack.some((haystackItem) => checkIsSurveyLogicValueEqual(haystackItem, item));
  if (typeof haystack === "object" || typeof item === "object") return false;

  return toSurveyLogicText(haystack).includes(toSurveyLogicText(item));
};
