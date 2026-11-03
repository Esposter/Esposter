import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { avgFunction } from "#src/services/functions/avgFunction";
import { avgInArrayFunction } from "#src/services/functions/avgInArrayFunction";
import { countFunction } from "#src/services/functions/countFunction";
import { countInArrayFunction } from "#src/services/functions/countInArrayFunction";
import { iifFunction } from "#src/services/functions/iifFunction";
import { maxFunction } from "#src/services/functions/maxFunction";
import { maxInArrayFunction } from "#src/services/functions/maxInArrayFunction";
import { minFunction } from "#src/services/functions/minFunction";
import { minInArrayFunction } from "#src/services/functions/minInArrayFunction";
import { substringFunction } from "#src/services/functions/substringFunction";
import { sumFunction } from "#src/services/functions/sumFunction";
import { sumInArrayFunction } from "#src/services/functions/sumInArrayFunction";

// The list, text and logic functions, keyed by their lowercase name
export const generalFunctionMap: Record<string, SurveyLogicFunction> = {
  avg: avgFunction,
  avginarray: avgInArrayFunction,
  count: countFunction,
  countinarray: countInArrayFunction,
  iif: iifFunction,
  max: maxFunction,
  maxinarray: maxInArrayFunction,
  min: minFunction,
  mininarray: minInArrayFunction,
  substring: substringFunction,
  sum: sumFunction,
  suminarray: sumInArrayFunction,
};
