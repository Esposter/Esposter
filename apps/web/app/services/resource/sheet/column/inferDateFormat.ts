import { DateFormat, DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { parseDate } from "#shared/util/date/parseDate";
import { normalizeString, takeOne } from "@esposter/shared";

export const inferDateFormat = (values: string[]): DateFormat => {
  const normalizedValues = values.map((value) => normalizeString(value)).filter(Boolean);
  for (const format of DateFormats)
    if (normalizedValues.every((value) => parseDate(value, format) !== undefined)) return format;
  return takeOne(DateFormats);
};
