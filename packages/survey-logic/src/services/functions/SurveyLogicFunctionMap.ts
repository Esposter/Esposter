import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { DateFunctionMap } from "#src/services/functions/DateFunctionMap";
import { GeneralFunctionMap } from "#src/services/functions/GeneralFunctionMap";

// Every function an expression may call, keyed by its lowercase name, so a lookup lowercases the name it was written with
export const SurveyLogicFunctionMap: Record<string, SurveyLogicFunction> = {
  ...DateFunctionMap,
  ...GeneralFunctionMap,
};
