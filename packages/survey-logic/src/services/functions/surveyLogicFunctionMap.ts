import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { dateFunctionMap } from "#src/services/functions/dateFunctionMap";
import { generalFunctionMap } from "#src/services/functions/generalFunctionMap";

// Every function an expression may call, keyed by its lowercase name, so a lookup lowercases the name it was written with
export const surveyLogicFunctionMap: Record<string, SurveyLogicFunction> = {
  ...dateFunctionMap,
  ...generalFunctionMap,
};
