import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { avgInArrayFunction } from "#src/services/functions/avgInArrayFunction";
import { countInArrayFunction } from "#src/services/functions/countInArrayFunction";
import { maxInArrayFunction } from "#src/services/functions/maxInArrayFunction";
import { minInArrayFunction } from "#src/services/functions/minInArrayFunction";
import { sumInArrayFunction } from "#src/services/functions/sumInArrayFunction";

// The array functions, keyed by their lowercase name: the family whose filter form the check refuses
export const ArrayFunctionMap: Record<string, SurveyLogicFunction> = {
  avginarray: avgInArrayFunction,
  countinarray: countInArrayFunction,
  maxinarray: maxInArrayFunction,
  mininarray: minInArrayFunction,
  suminarray: sumInArrayFunction,
};
