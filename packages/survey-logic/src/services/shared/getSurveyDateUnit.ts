import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getSurveyOptionalArgument } from "#src/services/shared/getSurveyOptionalArgument";

// The unit an interval argument names: its default when it is empty, otherwise the text it holds. A value that is not text
// Names no unit
export const getSurveyDateUnit = (value: SurveyLogicValue, defaultUnit: string): string | undefined =>
  getSurveyOptionalArgument(value, defaultUnit, (text) => (typeof text === "string" ? text : undefined));
