import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// A value is a number when it reads as one, so a list holding one number is a number too, as SurveyJS reads it
export const checkIsSurveyLogicNumber = (value: SurveyLogicValue): boolean => !Number.isNaN(toSurveyLogicNumber(value));
