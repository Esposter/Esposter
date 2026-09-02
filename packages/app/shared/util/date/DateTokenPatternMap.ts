import { DateToken } from "#shared/util/date/DateToken";

// Only the numeric tokens and the offset can be read back out of a string. A month or weekday name is
// Locale text, and the meridiem depends on an hour token that may not be there, so a format built from
// Them is a display format rather than a storage one — `parseDate` refuses it rather than guessing.
export const DateTokenPatternMap: Partial<Record<DateToken, string>> = {
  [DateToken.D]: String.raw`(\d{1,2})`,
  [DateToken.DD]: String.raw`(\d{2})`,
  [DateToken.H]: String.raw`(\d{1,2})`,
  [DateToken.HH]: String.raw`(\d{2})`,
  [DateToken.M]: String.raw`(\d{1,2})`,
  [DateToken.MM]: String.raw`(\d{2})`,
  [DateToken.mm]: String.raw`(\d{2})`,
  [DateToken.ss]: String.raw`(\d{2})`,
  [DateToken.YYYY]: String.raw`(\d{4})`,
  [DateToken.Z]: String.raw`([+-]\d{2}:?\d{2}|Z)`,
};
