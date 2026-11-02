import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { parseDate } from "#shared/util/date/parseDate";

const ISO_LEADING_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/u;
const LETTER_REGEX = /\p{L}/u;

// The engine rolls a day its calendar lacks into the next month, and guesses the order of a bare number's parts, so it
// Reads only what names its date: text with a letter in it, a month or a weekday, or a leading ISO date that exists
const checkIsEngineReadable = (value: string) =>
  ISO_LEADING_DATE_REGEX.test(value)
    ? parseDate(value.slice(0, ISO_DATE_FORMAT.length), ISO_DATE_FORMAT) !== undefined
    : LETTER_REGEX.test(value);

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
