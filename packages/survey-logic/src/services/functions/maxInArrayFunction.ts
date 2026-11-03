import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyValueGreater } from "#src/services/shared/checkIsSurveyValueGreater";
import { getSurveyArrayExtreme } from "#src/services/shared/getSurveyArrayExtreme";
import { getSurveyArrayParams } from "#src/services/shared/getSurveyArrayParams";

// The largest value of a field over the items of an array value, or the returned field of the item that holds it. A
// Filter is empty, as it is for sumInArray
export const maxInArrayFunction: SurveyLogicFunction = (args) => {
  const params = getSurveyArrayParams(args);
  if (params === undefined || params.isFiltered) return undefined;

  return getSurveyArrayExtreme(params, (best, candidate) => checkIsSurveyValueGreater(candidate, best));
};
