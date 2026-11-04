import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyArrayExtreme } from "#src/services/shared/getSurveyArrayExtreme";
import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";

// The largest value of a field over the items whose field reads as a number, or the returned field of the item that holds it.
// A filter is empty, as it is for sumInArray
export const maxInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined || params.isFiltered) return undefined;

  return getSurveyArrayExtreme(params, (best, candidate) => candidate > best);
};
