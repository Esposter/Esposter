import { CALENDAR_DATE_REGEX, EPOCH_YEAR } from "#src/services/oxlint/testValues/constants";

// A string carrying a calendar date outside the epoch's year — the typed date the string visitor reports on
// Its own, whatever expression it sits inside
export const checkIsTypedCalendarDate = (text: string): boolean => {
  const year = CALENDAR_DATE_REGEX.exec(text)?.groups?.year;
  return year !== undefined && year !== EPOCH_YEAR;
};
