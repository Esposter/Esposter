import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { addSurveyLogicValues } from "#src/services/shared/addSurveyLogicValues";
import { roundSurveyLogicSum } from "#src/services/shared/roundSurveyLogicSum";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// A list and a value that is not a list.
// A text joins the list's items with a comma and a space, a number adds the list's numbers, and anything else adds as
// JavaScript adds.
// `isListFirst` keeps the list on the left of the sum
export const sumSurveyLogicListWithValue = (
  list: SurveyLogicValue[],
  value: SurveyLogicValue,
  isListFirst: boolean,
): SurveyLogicValue => {
  if (typeof value === "string") {
    const joinedList = list.map((item) => toSurveyLogicText(item)).join(", ");
    return isListFirst ? joinedList + value : value + joinedList;
  }
  if (typeof value === "number") {
    let listSum = 0;
    for (const item of list) if (typeof item === "number") listSum = roundSurveyLogicSum(listSum, item, listSum + item);

    return roundSurveyLogicSum(listSum, value, listSum + value);
  }

  return isListFirst ? addSurveyLogicValues(list, value) : addSurveyLogicValues(value, list);
};
