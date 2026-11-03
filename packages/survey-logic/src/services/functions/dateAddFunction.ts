import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";

// Each interval moves a date through the setter of its own unit
const unitAdditionMap: Record<string, (date: Date, amount: number) => void> = {
  days: (date, amount) => {
    date.setDate(date.getDate() + amount);
  },
  hours: (date, amount) => {
    date.setHours(date.getHours() + amount);
  },
  minutes: (date, amount) => {
    date.setMinutes(date.getMinutes() + amount);
  },
  months: (date, amount) => {
    date.setMonth(date.getMonth() + amount);
  },
  seconds: (date, amount) => {
    date.setSeconds(date.getSeconds() + amount);
  },
  years: (date, amount) => {
    date.setFullYear(date.getFullYear() + amount);
  },
};

// The date moved by an amount of an interval, in days by default. An interval SurveyJS does not know leaves the date as it is
export const dateAddFunction: SurveyLogicFunction = (args) => {
  const [dateValue, amountValue, intervalValue] = args;

  // SurveyJS reads a zero amount as no amount, so the result is empty rather than the date
  if (args.length < 2 || !dateValue || !amountValue) return undefined;

  const amount = getSurveyNumber(amountValue);
  const interval = intervalValue || "days";
  const addToDate = typeof interval === "string" ? getOwnValue(unitAdditionMap, interval) : undefined;
  const date = parseSurveyLogicDate(dateValue);

  addToDate?.(date, amount);

  return toSurveyLogicDate(date);
};
