import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { parseDate } from "#shared/util/date/parseDate";

// A date read out of text nobody promised a format for — a sheet cell, a filter value someone typed. The ISO
// Calendar date is tried first because the platform reads a bare `YYYY-MM-DD` as UTC midnight, which is the
// Previous day for every reader west of it; everything else falls through to the engine's own parsing.
export const parseLooseDate = (value: string): Date | undefined => {
  const isoDate = parseDate(value, ISO_DATE_FORMAT);
  if (isoDate) return isoDate;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};
