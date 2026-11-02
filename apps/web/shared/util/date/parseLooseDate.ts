import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { parseDate } from "#shared/util/date/parseDate";

const ISO_LEADING_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/u;
const LETTER_REGEX = /\p{L}/u;
const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// The engine reads a word by its first three letters, so the check does too
const MONTH_NAME_REGEX = /\b(?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/iu;
const YEAR_REGEX = /\b\d{4}\b/u;
// A number of one or two digits that no colon joins to a time
const DAY_CANDIDATE_REGEX = /(?<![\d:])\d{1,2}(?![\d:])/gu;
// The year the engine gives a text with none, a common one, so a yearless 29 February reads as 1 March
const ENGINE_DEFAULT_YEAR = 2001;

// The engine rolls a day its named month lacks into the next month, so "30 Feb 2026" reads as 2 March. The text names its
// Month, so it is refused when none of its numbers that could be its day fits that month. It is never judged by the
// Engine's own day, which a time zone or a time moves across a month's edge without the text being wrong
const checkIsDayRolled = (value: string) => {
  const month = MONTH_NAME_REGEX.exec(value)?.groups?.month;
  if (!month) return false;

  const { daysInMonth } = Temporal.PlainYearMonth.from({
    month: MONTH_NAMES.indexOf(month.toLowerCase()) + 1,
    year: Number(YEAR_REGEX.exec(value)?.[0] ?? ENGINE_DEFAULT_YEAR),
  });
  const days = Array.from(value.matchAll(DAY_CANDIDATE_REGEX), ([day]) => Number(day));
  return days.length > 0 && days.every((day) => day > daysInMonth);
};

// The engine guesses the order of a bare number's parts, so it reads only what names its date: text with a letter in it,
// A month or a weekday, whose day its month has, or a leading ISO date that exists
const checkIsEngineReadable = (value: string) =>
  ISO_LEADING_DATE_REGEX.test(value)
    ? parseDate(value.slice(0, ISO_DATE_FORMAT.length), ISO_DATE_FORMAT) !== undefined
    : LETTER_REGEX.test(value) && !checkIsDayRolled(value);

// A date read out of text — a sheet cell, a filter value someone typed. The format the text was written in is tried
// First when the caller has one, because the engine reads a day-first value as month-first. The ISO Calendar date
// Comes next: the platform reads a bare `YYYY-MM-DD` as UTC midnight, which is the previous day for every reader west
// Of it. Everything else falls through to the engine's own parsing, when the engine is the one that may read it.
export const parseLooseDate = (value: string, format?: string): Date | undefined => {
  const formattedDate = format === undefined ? undefined : parseDate(value, format);
  if (formattedDate) return formattedDate;

  const isoDate = parseDate(value, ISO_DATE_FORMAT);
  if (isoDate) return isoDate;

  if (!checkIsEngineReadable(value)) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};
