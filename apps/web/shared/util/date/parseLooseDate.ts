import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { parseDate } from "#shared/util/date/parseDate";

// A date read out of text — a sheet cell, a filter value someone typed. The format the text was written in is tried
// First when the caller has one, because the engine reads a day-first value as month-first. The ISO Calendar date
// Comes next: the platform reads a bare `YYYY-MM-DD` as UTC midnight, which is the previous day for every reader west
// Of it. Everything else falls through to the engine's own parsing.
export const parseLooseDate = (value: string, format?: string): Date | undefined => {
  const formattedDate = format === undefined ? undefined : parseDate(value, format);
  if (formattedDate) return formattedDate;

  const isoDate = parseDate(value, ISO_DATE_FORMAT);
  if (isoDate) return isoDate;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};
