import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { addSurveyLogicMonths } from "#src/services/shared/addSurveyLogicMonths";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// Each interval moves a date through its own unit: days by the calendar day, hours, minutes and seconds by the wall clock,
// And months and years by whole calendar months
const unitAdditionMap: Record<string, (date: Date, amount: number) => void> = {
  days: (date, amount) => {
    date.setUTCDate(date.getUTCDate() + amount);
  },
  hours: (date, amount) => {
    date.setUTCHours(date.getUTCHours() + amount);
  },
  minutes: (date, amount) => {
    date.setUTCMinutes(date.getUTCMinutes() + amount);
  },
  months: (date, amount) => {
    addSurveyLogicMonths(date, amount);
  },
  seconds: (date, amount) => {
    date.setUTCSeconds(date.getUTCSeconds() + amount);
  },
  years: (date, amount) => {
    addSurveyLogicMonths(date, amount * 12);
  },
};

// The date moved by a whole number of an interval, in days by default. An empty interval is days; an unknown one, an empty amount
// And a date that names no date have no result. A zero amount is the date itself
export const dateAddFunction: SurveyLogicFunction = ([dateValue, amountValue, intervalValue]) => {
  const date = parseSurveyLogicDate(dateValue);
  const amount = toSurveyLogicNumber(amountValue);
  const unit = checkIsSurveyLogicValueEmpty(intervalValue) ? "days" : intervalValue;
  const addToDate = typeof unit === "string" ? getOwnValue(unitAdditionMap, unit) : undefined;
  if (date === undefined || amount === undefined || addToDate === undefined) return undefined;

  addToDate(date, Math.trunc(amount));

  return toSurveyLogicDate(date);
};
