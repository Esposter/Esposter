import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseMonthDay } from "#src/services/parseMonthDay";

export const getBirthdayLine = ({ birthday, name }: Character, today: MonthDay): string => {
  const birthdayMonthDay = parseMonthDay(birthday);
  if (!birthdayMonthDay) return "";

  const daysAhead = getDaysUntil(today, birthdayMonthDay);
  const daysBehind = getDaysUntil(birthdayMonthDay, today);
  if (daysAhead === 0) return `Today is ${name}'s birthday.`;
  else if (daysAhead <= daysBehind)
    return `${name}'s birthday is ${daysAhead === 1 ? "tomorrow" : `in ${daysAhead} days`}.`;
  else return `${name}'s birthday was ${daysBehind === 1 ? "yesterday" : `${daysBehind} days ago`}.`;
};
