import type { SurveyLogicArrayParams } from "#src/models/SurveyLogicArrayParams";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The extreme of an array's fields, by the numbers they read as: the item whose field the comparison prefers, then that item's field, or its returned field when the arguments name one
export const getSurveyArrayExtreme = (
  params: SurveyLogicArrayParams,
  checkReplaces: (best: number, candidate: number) => boolean,
): SurveyLogicValue => {
  const best = getSurveyExtreme(params.rows, (bestRow, candidateRow) =>
    checkReplaces(bestRow.field, candidateRow.field),
  );
  if (best === undefined) return undefined;

  return params.returnField === undefined ? best.field : getOwnValue(best.item, params.returnField);
};
