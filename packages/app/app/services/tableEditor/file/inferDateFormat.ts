import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { dayjs } from "#shared/services/dayjs";
import { takeOne } from "@esposter/shared";

export const inferDateFormat = (values: string[]): (typeof DATE_FORMATS)[number] => {
  const trimmedValues = values.map((value) => value.trim()).filter(Boolean);
  for (const format of DATE_FORMATS)
    if (trimmedValues.every((value) => dayjs(value, format, true).isValid())) return format;
  return takeOne(DATE_FORMATS);
};
