import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { ageFunction } from "#src/services/functions/ageFunction";
import { currentDateFunction } from "#src/services/functions/currentDateFunction";
import { currentYearFunction } from "#src/services/functions/currentYearFunction";
import { dateAddFunction } from "#src/services/functions/dateAddFunction";
import { dateDiffFunction } from "#src/services/functions/dateDiffFunction";
import { dayFunction } from "#src/services/functions/dayFunction";
import { diffDaysFunction } from "#src/services/functions/diffDaysFunction";
import { getDateFunction } from "#src/services/functions/getDateFunction";
import { getYearFunction } from "#src/services/functions/getYearFunction";
import { monthFunction } from "#src/services/functions/monthFunction";
import { roundFunction } from "#src/services/functions/roundFunction";
import { todayFunction } from "#src/services/functions/todayFunction";
import { truncFunction } from "#src/services/functions/truncFunction";
import { weekdayFunction } from "#src/services/functions/weekdayFunction";
import { yearFunction } from "#src/services/functions/yearFunction";

// The date and number functions, keyed by their lowercase name
export const dateFunctionMap: Record<string, SurveyLogicFunction> = {
  age: ageFunction,
  currentdate: currentDateFunction,
  currentyear: currentYearFunction,
  dateadd: dateAddFunction,
  datediff: dateDiffFunction,
  day: dayFunction,
  diffdays: diffDaysFunction,
  getdate: getDateFunction,
  getyear: getYearFunction,
  month: monthFunction,
  round: roundFunction,
  today: todayFunction,
  trunc: truncFunction,
  weekday: weekdayFunction,
  year: yearFunction,
};
