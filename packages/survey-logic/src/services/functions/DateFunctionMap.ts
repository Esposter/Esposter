import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { ageFunction } from "#src/services/functions/ageFunction";
import { dateAddFunction } from "#src/services/functions/dateAddFunction";
import { dateDiffFunction } from "#src/services/functions/dateDiffFunction";
import { dayFunction } from "#src/services/functions/dayFunction";
import { monthFunction } from "#src/services/functions/monthFunction";
import { roundFunction } from "#src/services/functions/roundFunction";
import { todayFunction } from "#src/services/functions/todayFunction";
import { truncFunction } from "#src/services/functions/truncFunction";
import { weekdayFunction } from "#src/services/functions/weekdayFunction";
import { yearFunction } from "#src/services/functions/yearFunction";

// The date and number functions, keyed by their lowercase name
export const DateFunctionMap: Record<string, SurveyLogicFunction> = {
  age: ageFunction,
  dateadd: dateAddFunction,
  datediff: dateDiffFunction,
  day: dayFunction,
  month: monthFunction,
  round: roundFunction,
  today: todayFunction,
  trunc: truncFunction,
  weekday: weekdayFunction,
  year: yearFunction,
};
