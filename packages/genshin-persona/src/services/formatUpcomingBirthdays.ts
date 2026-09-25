import type { Character } from "#src/models/Character";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { BIRTHDAY_DATE_FORMAT, UPCOMING_BIRTHDAYS_DAYS } from "#src/services/constants";
import { getDaysUntil } from "#src/services/getDaysUntil";
import { parseBirthday } from "#src/services/parseBirthday";

// The other birthdays within the week ahead, nearest first, as one line of the welcome — the runners-up the
// Birthday pick measured and dropped; "" when the week holds none. The session's own character is left out because
// The note above already says theirs
export const formatUpcomingBirthdays = (
  roster: Character[],
  today: Temporal.PlainDate,
  name: string,
  { locale, strings }: ResolvedLocalization,
): string => {
  const upcoming = roster
    .flatMap((character) => {
      const birthday = parseBirthday(character.birthday);
      if (character.name === name || !birthday) return [];

      const daysAhead = getDaysUntil(today, birthday);
      return daysAhead <= UPCOMING_BIRTHDAYS_DAYS ? [{ birthday, character, daysAhead }] : [];
    })
    .toSorted(
      (firstBirthday, secondBirthday) =>
        firstBirthday.daysAhead - secondBirthday.daysAhead ||
        firstBirthday.character.name.localeCompare(secondBirthday.character.name),
    );
  if (upcoming.length === 0) return "";

  const list = new Intl.ListFormat(locale, { type: "conjunction" }).format(
    upcoming.map(
      ({ birthday, character }) => `${character.displayName} ${birthday.toLocaleString(locale, BIRTHDAY_DATE_FORMAT)}`,
    ),
  );
  return strings.upcomingBirthdays(list);
};
