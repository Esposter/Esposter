import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseBirthday } from "#src/services/parseBirthday";

// The plugin's aside, in brackets so it reads as a caption beside the character's own line: the date the person
// May ask about, and the distance that says why this character was picked. It is the plugin speaking rather than
// The character, so it is translated into the interface language rather than performed in the reply language
export const getBirthdayNote = (
  birthday: string,
  today: Temporal.PlainDate,
  { dateLocale, strings }: ResolvedLocalization,
): string => {
  const birthdayDate = parseBirthday(birthday);
  if (!birthdayDate) return "";

  const daysAhead = getDaysUntil(today, birthdayDate);
  const daysBehind = getDaysUntil(birthdayDate, today);
  const getDistance = () => {
    if (daysAhead === 0) return strings.today;
    else if (daysAhead <= daysBehind) return daysAhead === 1 ? strings.tomorrow : strings.inDays(daysAhead);
    else return daysBehind === 1 ? strings.yesterday : strings.daysAgo(daysBehind);
  };
  const formattedDate = birthdayDate.toLocaleString(dateLocale, { day: "numeric", month: "long" });
  return strings.birthdayNote(formattedDate, getDistance());
};
