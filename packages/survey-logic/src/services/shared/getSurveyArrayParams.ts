import type { SurveyLogicArrayParams } from "#src/models/SurveyLogicArrayParams";
import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyFieldName } from "#src/services/shared/checkIsSurveyFieldName";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyArrayItems } from "#src/services/shared/getSurveyArrayItems";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// Reads an array function's arguments as SurveyJS does: the array or matrix values, the field's name, and a third text that names a field to return when it holds no condition characters.
// An item counts only when its field reads as a number
export const getSurveyArrayParams = (args: SurveyLogicValue[]): SurveyLogicArrayParams | undefined => {
  const [data, name, returnCandidate] = args;
  if (args.length < 2 || args.length > 4 || typeof name !== "string") return undefined;

  const hasReturnField =
    args.length > 2 && typeof returnCandidate === "string" && checkIsSurveyFieldName(returnCandidate);
  const filterIndex = hasReturnField ? 3 : 2;
  const rows: SurveyLogicArrayRow[] = [];
  for (const item of getSurveyArrayItems(data)) {
    if (typeof item !== "object" || Array.isArray(item)) continue;

    const field = toSurveyLogicNumber(getOwnValue(item, name));
    if (field !== undefined) rows.push({ field, item });
  }

  return {
    isFiltered: args.length > filterIndex,
    returnField: hasReturnField && returnCandidate !== name ? returnCandidate : undefined,
    rows,
  };
};
