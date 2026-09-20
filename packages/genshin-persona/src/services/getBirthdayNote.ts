import type { MonthDay } from "#src/models/MonthDay";

import { formatMonthDay } from "#src/services/formatMonthDay";
import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseMonthDay } from "#src/services/parseMonthDay";

const getDistance = (daysAhead: number, daysBehind: number) => {
  if (daysAhead === 0) return "today";
  else if (daysAhead <= daysBehind) return daysAhead === 1 ? "tomorrow" : `in ${daysAhead} days`;
  else return daysBehind === 1 ? "yesterday" : `${daysBehind} days ago`;
};

// The plugin's aside, in brackets so it reads as a caption beside the character's own line: the date the person
// May ask about, and the distance that says why this character was picked
export const getBirthdayNote = (birthday: string, today: MonthDay): string => {
  const birthdayMonthDay = parseMonthDay(birthday);
  if (!birthdayMonthDay) return "";

  const daysAhead = getDaysUntil(today, birthdayMonthDay);
  const daysBehind = getDaysUntil(birthdayMonthDay, today);
  return `[birthday ${formatMonthDay(birthdayMonthDay)}, ${getDistance(daysAhead, daysBehind)}]`;
};
