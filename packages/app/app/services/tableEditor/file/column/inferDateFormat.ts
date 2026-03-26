import { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";
import { takeOne } from "@esposter/shared";

export const inferDateFormat = (values: string[]): DateFormat => {
  const trimmedValues = values.map((value) => value.trim()).filter(Boolean);
  for (const format of Object.values(DateFormat))
    if (trimmedValues.every((value) => dayjs(value, format, true).isValid())) return format;
  return takeOne(Object.values(DateFormat));
};
