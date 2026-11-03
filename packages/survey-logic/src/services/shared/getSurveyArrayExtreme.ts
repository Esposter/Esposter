import type { SurveyLogicArrayParams } from "#src/models/SurveyLogicArrayParams";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyArrayValue } from "#src/services/shared/getSurveyArrayValue";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The extreme of an array's values, by the number each item's field reads as: the item's field, or the item's returned
// Field when the arguments name one. An item whose field reads as no number takes no part
export const getSurveyArrayExtreme = (
  params: SurveyLogicArrayParams,
  checkReplaces: (best: SurveyLogicValue, candidate: SurveyLogicValue) => boolean,
): SurveyLogicValue => {
  const rows = params.rows
    .map((row) => ({ field: getSurveyArrayValue(row.field), item: row.item }))
    .filter((row) => row.field !== undefined && row.field !== null);
  const best = getSurveyExtreme(rows, (bestRow, candidateRow) => checkReplaces(bestRow.field, candidateRow.field));
  if (best === undefined) return undefined;

  return params.returnField === undefined ? best.field : getOwnValue(best.item, params.returnField);
};
