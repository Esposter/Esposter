import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { addSurveyValues } from "#src/services/shared/addSurveyValues";

// The total of the values from zero, with unanswered values, lists and records skipped. Empty when a total cannot be trimmed
export const sumSurveyValues = (values: SurveyLogicValue[]): number | string | undefined => {
  let total: number | string = 0;
  for (const value of values) {
    if (value === undefined || typeof value === "object") continue;

    const nextTotal = addSurveyValues(total, value);
    if (nextTotal === undefined) return undefined;

    total = nextTotal;
  }

  return total;
};
