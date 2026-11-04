import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The value an operator reads from one of its operands: a list reads as its text, and anything else as itself
export const toSurveyLogicPrimitive = (value: SurveyLogicValue): SurveyLogicValue =>
  Array.isArray(value) ? toSurveyLogicText(value) : value;
