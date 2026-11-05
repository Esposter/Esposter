import type { SurveyLogicArrayParams } from "#src/models/SurveyLogicArrayParams";
import type { SurveyLogicArrayRow } from "#src/models/SurveyLogicArrayRow";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyReturnField } from "#src/services/shared/checkIsSurveyReturnField";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyArrayItems } from "#src/services/shared/getSurveyArrayItems";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// Reads an array function's arguments: the array or matrix values, the field's name, and a third text that names a field to
// Return when it holds no condition characters. An item counts only when its field reads as a number (R4). A filter is any
// Argument past those the form takes, so a call that passes one has no params and no array function answers it
export const getSurveyArrayParams = (args: SurveyLogicValue[]): SurveyLogicArrayParams | undefined => {
  const [data, name, returnCandidate] = args;
  if (args.length < 2 || args.length > 4 || typeof name !== "string") return undefined;

  const hasReturnField = args.length > 2 && checkIsSurveyReturnField(returnCandidate);
  const filterIndex = hasReturnField ? 3 : 2;
  if (args.length > filterIndex) return undefined;

  const rows: SurveyLogicArrayRow[] = [];
  for (const item of getSurveyArrayItems(data)) {
    if (typeof item !== "object" || Array.isArray(item)) continue;

    const field = toSurveyLogicNumber(getOwnValue(item, name));
    if (field !== undefined) rows.push({ field, item });
  }

  return { returnField: hasReturnField && returnCandidate !== name ? returnCandidate : undefined, rows };
};
