import type { SurveyLogicArrayParams } from "#src/models/SurveyLogicArrayParams";
import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyFieldName } from "#src/services/shared/checkIsSurveyFieldName";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyArrayItems } from "#src/services/shared/getSurveyArrayItems";

// Reads an array function's arguments as SurveyJS does: the array or matrix values, the field's name, and a third text that
// Names a field to return when it holds no condition characters. The items without the field, or whose field is empty, are
// Left out
export const getSurveyArrayParams = (args: SurveyLogicValue[]): SurveyLogicArrayParams | undefined => {
  const [data, name, returnCandidate] = args;
  if (args.length < 2 || args.length > 4 || !data || typeof name !== "string") return undefined;

  const hasReturnField =
    args.length > 2 && typeof returnCandidate === "string" && checkIsSurveyFieldName(returnCandidate);
  const filterIndex = hasReturnField ? 3 : 2;
  const rows: SurveyLogicArrayRow[] = [];
  for (const item of getSurveyArrayItems(data)) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) continue;

    const field = getOwnValue(item, name);
    if (!checkIsSurveyLogicValueEmpty(field)) rows.push({ field, item });
  }

  return {
    isFiltered: args.length > filterIndex,
    returnField: hasReturnField && returnCandidate !== name ? returnCandidate : undefined,
    rows,
  };
};
