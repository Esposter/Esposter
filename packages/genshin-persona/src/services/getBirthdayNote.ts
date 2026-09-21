import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseBirthday } from "#src/services/parseBirthday";

// The plugin's aside, in brackets so it reads as a caption beside the character's own line: the date the person
// May ask about, and the distance that says why this character was picked. It is the plugin speaking rather than
// The character, so it is in the interface language rather than performed in the reply language — and the date
// And the distance are the runtime's words in it, since `Intl` already says "tomorrow" and "2 days ago" in every
// Language, with the plural forms a hand-written template gets wrong. The nearer side of the year wins, and a tie
// Reads as ahead
export const getBirthdayNote = (
  birthday: string,
  today: Temporal.PlainDate,
  { locale, strings }: ResolvedLocalization,
): string => {
  const birthdayDate = parseBirthday(birthday);
  if (!birthdayDate) return "";

  const daysAhead = getDaysUntil(today, birthdayDate);
  const daysBehind = getDaysUntil(birthdayDate, today);
  const distance = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    daysAhead <= daysBehind ? daysAhead : -daysBehind,
    "day",
  );
  const formattedDate = birthdayDate.toLocaleString(locale, { day: "numeric", month: "long" });
  return strings.birthdayNote(formattedDate, distance);
};
