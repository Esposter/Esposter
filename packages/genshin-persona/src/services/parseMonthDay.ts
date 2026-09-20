import type { MonthDay } from "#src/models/MonthDay";

const MONTH_DAY_REGEX = /^(?<month>\d{1,2})\/(?<day>\d{1,2})$/u;

export const parseMonthDay = (birthday: string): MonthDay | undefined => {
  const match = MONTH_DAY_REGEX.exec(birthday);
  if (!match?.groups) return undefined;

  return { day: Number(match.groups.day), month: Number(match.groups.month) };
};
