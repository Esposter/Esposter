import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { avgFunction } from "#src/services/functions/avgFunction";
import { countFunction } from "#src/services/functions/countFunction";
import { iifFunction } from "#src/services/functions/iifFunction";
import { maxFunction } from "#src/services/functions/maxFunction";
import { minFunction } from "#src/services/functions/minFunction";
import { substringFunction } from "#src/services/functions/substringFunction";
import { sumFunction } from "#src/services/functions/sumFunction";

// The list, text and logic functions, keyed by their lowercase name
export const GeneralFunctionMap: Record<string, SurveyLogicFunction> = {
  avg: avgFunction,
  count: countFunction,
  iif: iifFunction,
  max: maxFunction,
  min: minFunction,
  substring: substringFunction,
  sum: sumFunction,
};
