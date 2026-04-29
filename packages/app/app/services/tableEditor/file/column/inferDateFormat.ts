import { DateFormat, DateFormats } from "#shared/models/tableEditor/file/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";
import { normalizeString, takeOne } from "@esposter/shared";

export const inferDateFormat = (values: string[]): DateFormat => {
  const trimmedValues = values.map(normalizeString).filter(Boolean);
  for (const format of DateFormats)
    if (trimmedValues.every((value) => dayjs(value, format, true).isValid())) return format;
  return takeOne([...DateFormats]);
};
