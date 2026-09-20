import { DATE_LOCALE } from "#src/services/constants";
import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseBirthday } from "#src/services/parseBirthday";

const getDistance = (daysAhead: number, daysBehind: number) => {
  if (daysAhead === 0) return "today";
  else if (daysAhead <= daysBehind) return daysAhead === 1 ? "tomorrow" : `in ${daysAhead} days`;
  else return daysBehind === 1 ? "yesterday" : `${daysBehind} days ago`;
};

// The plugin's aside, in brackets so it reads as a caption beside the character's own line: the date the person
// may ask about, and the distance that says why this character was picked
export const getBirthdayNote = (birthday: string, today: Temporal.PlainDate): string => {
  const birthdayDate = parseBirthday(birthday);
  if (!birthdayDate) return "";

  const daysAhead = getDaysUntil(today, birthdayDate);
  const daysBehind = getDaysUntil(birthdayDate, today);
  const formattedDate = birthdayDate.toLocaleString(DATE_LOCALE, { day: "numeric", month: "long" });
  return `[Birthday: ${formattedDate}, ${getDistance(daysAhead, daysBehind)}]`;
};
