import { LEAP_YEAR } from "#src/services/constants";

const MONTH_DAY_REGEX = /^(?<month>\d{1,2})\/(?<day>\d{1,2})$/u;

// The game spells a birthday as an unpadded "9/20" and gives it no year. Every one is read into the same leap
// Year, so two birthdays are comparable, 29 February is a day like any other, and December and January are
// Neighbours
export const parseBirthday = (birthday: string): Temporal.PlainDate | undefined => {
  const match = MONTH_DAY_REGEX.exec(birthday);
  if (match?.groups)
    return Temporal.PlainDate.from({
      day: Number(match.groups.day),
      month: Number(match.groups.month),
      year: LEAP_YEAR,
    });
  else return undefined;
};
